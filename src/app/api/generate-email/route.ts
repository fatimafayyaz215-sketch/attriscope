import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { computeDaysInactiveFromLastLogin } from "@/lib/inactivity";

const GEMINI_MODELS = ["gemini-2.5-flash-lite", "gemini-3.1-flash-lite"] as const;
const GENERATION_TIMEOUT_MS = 12000;

function isRetryableGeminiError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /(503|429|500|502|504|service unavailable|high demand|temporar|overloaded|try again later)/i.test(msg);
}

async function generateGeminiTextWithFallback(genAI: GoogleGenerativeAI, prompt: string): Promise<string> {
  let lastErr: unknown;

  for (const modelName of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 1; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Gemini generation timed out")), GENERATION_TIMEOUT_MS),
          ),
        ]);
        return result.response.text();
      } catch (err: unknown) {
        lastErr = err;
        const canRetrySameModel = isRetryableGeminiError(err) && attempt < 0;
        if (canRetrySameModel) {
          await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
          continue;
        }
        break;
      }
    }
  }

  throw lastErr ?? new Error("Gemini request failed");
}

function sanitizeEmailBody(rawBody: string, company?: string | null): string {
  let body = rawBody.trim();

  // Remove accidental subject headings from the email body.
  body = body
    .replace(/^\s*subject\s*:\s*.*\r?\n?/i, "")
    .replace(/^\s*email\s*subject\s*:\s*.*\r?\n?/i, "")
    .replace(/^\s*#+\s*subject\s*.*\r?\n?/i, "")
    .trim();

  // Enforce neutral wording for company references.
  if (company) {
    body = body.replaceAll(company, "our team");
  }
  body = body
    .replace(/\b(your|their)\s+(company|organisation|organization)\b/gi, "our team")
    .replace(/\bour\s+(company|organisation|organization)\b/gi, "our team")
    .replace(/\borganization\b/gi, "team")
    .replace(/\borganisation\b/gi, "team")
    .replace(/\bcompany_name\b/gi, "our team");

  return body;
}

function buildFallbackEmailBody(customer: { name: string }, reasonString: string): string {
  return [
    `Hi ${customer.name},`,
    "",
    `We wanted to check in because ${reasonString}.`,
    "",
    "We would love to help you get more value. If helpful, we can offer a short onboarding refresh plus a time-bound incentive to support reactivation.",
    "",
    "Would you be open to a quick 15-minute check-in this week?",
    "",
    "Best regards,",
    "Our Customer Success Team",
  ].join("\n");
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { customerId, tone = "professional" } = await request.json();
  if (!customerId) return NextResponse.json({ error: "Missing customerId" }, { status: 400 });

  // Fetch the customer
  const { data: customer, error: custErr } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .eq("user_id", user.id)
    .single();

  if (custErr || !customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const dynamicDaysInactive = computeDaysInactiveFromLastLogin(customer.last_login_at, customer.days_inactive);

  // Fetch sender's profile (auth user email as fallback sender name)
  const { data: authUser } = await supabase.auth.getUser();
  const senderEmail = authUser.user?.email ?? "the team";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });

  const genAI = new GoogleGenerativeAI(apiKey);

  const riskReasons: string[] = [];
  if (dynamicDaysInactive > 14) riskReasons.push(`has not logged in for ${dynamicDaysInactive} days`);
  if (Number(customer.usage_drop) > 0.2) riskReasons.push(`usage dropped by ${Math.round(Number(customer.usage_drop) * 100)}%`);
  if (customer.support_complaints > 0) riskReasons.push(`has ${customer.support_complaints} unresolved support ticket(s)`);
  if (customer.payment_delay) riskReasons.push("has a delayed payment");

  const reasonString = riskReasons.length > 0 ? riskReasons.join(", ") : "shows signs of disengagement";

  const prompt = `Write a ${tone} retention email to win back an at-risk customer. The email should be warm, specific, and offer a clear next step.

Customer name: ${customer.name}
Risk indicators: ${reasonString}
Sender: Your Customer Success Team

Rules:
- Keep it under 200 words
- Personalise it with the specific risk indicators
- End with a clear call to action (book a call, reply, etc.)
- Output ONLY the email body text (do not include any subject line)
- Do not write "Subject:" or any subject-like header
- Do not mention any company name (including customer company names)
- Use neutral wording like "we", "our", "our team" instead of company names/placeholders
- Use the actual customer name
- Plain text only, no markdown`;

  const subject = "Quick check-in — can we help?";
  let body = "";
  let source: "gemini" | "fallback" = "gemini";

  try {
    const generatedBody = await generateGeminiTextWithFallback(genAI, prompt);
    body = sanitizeEmailBody(generatedBody, customer.company);
  } catch {
    source = "fallback";
    body = buildFallbackEmailBody(customer, reasonString);
  }

  // Upsert the email draft (one draft per customer, overwrite on regenerate)
  const existingEmail = await supabase
    .from("outreach_emails")
    .select("id")
    .eq("user_id", user.id)
    .eq("customer_id", customerId)
    .eq("status", "draft")
    .single();

  if (existingEmail.data?.id) {
    await supabase
      .from("outreach_emails")
      .update({ subject, body })
      .eq("id", existingEmail.data.id);
  } else {
    await supabase.from("outreach_emails").insert({
      user_id: user.id,
      customer_id: customerId,
      to_email: customer.email,
      subject,
      body,
      status: "draft",
    });
  }

  return NextResponse.json({ subject, body, toEmail: customer.email, source });
}
