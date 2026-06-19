import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeDaysInactiveFromLastLogin } from "@/lib/inactivity";
import { generateGeminiText, hasGeminiApiKey } from "@/lib/gemini";
import { upsertOutreachDraft } from "@/lib/outreach-email";

const GENERATION_TIMEOUT_MS = 12000;//12 seconds
type Tone = "professional" | "friendly" | "urgent" | "discount" | "event";

function isTone(value: unknown): value is Tone {
  return value === "professional" || value === "friendly" || value === "urgent" || value === "discount" || value === "event";
}

function getSubjectForTone(tone: Tone, eventName: string | null): string {
  if (tone === "discount") return "A little welcome-back offer for you";
  if (tone === "event" && eventName) return `${eventName} check-in from our team`;
  if (tone === "event") return "Checking in and here to help";
  if (tone === "urgent") return "Quick check-in — can we help?";
  if (tone === "friendly") return "We miss you — can we support you?";
  return "Quick check-in — can we help?";
}

function buildPrompt(tone: Tone, customerName: string, reasonString: string, eventName: string | null): string {
  const toneInstruction =
    tone === "discount"
      ? "Write a retention email that includes a clear discount or incentive offer to encourage reactivation."
      : tone === "event"
        ? "Write a retention email with an event-based angle."
        : `Write a ${tone} retention email to win back an at-risk customer.`;

  const toneRules =
    tone === "discount"
      ? [
          "- Include one concrete, time-bound discount or incentive offer (for example: percentage off, free add-on, or waived fee)",
          "- Keep the offer realistic and concise",
        ]
      : tone === "event"
        ? [
            eventName
              ? `- Use ${eventName} as the event context and tie it naturally to re-engagement in one short sentence`
              : "- Keep this event-based but still focused on customer re-engagement",
            "- Keep the event mention subtle and professional",
          ]
        : [];

  return `${toneInstruction} The email should be warm, specific, and offer a clear next step.

Customer name: ${customerName}
Risk indicators: ${reasonString}
Sender: Your Customer Success Team

Rules:
- Keep it under 200 words
- Personalise it with the specific risk indicators
- Keep it clearly outreach-focused and engagement-oriented
- Mention one concrete benefit the customer gets by returning
- End with a clear call to action (book a call, reply, etc.)
- Output ONLY the email body text (do not include any subject line)
- Do not write "Subject:" or any subject-like header
- Do not mention any company name (including customer company names)
- Use neutral wording like "we", "our", "our team" instead of company names/placeholders
- Use the actual customer name
- Plain text only, no markdown
${toneRules.join("\n")}`;
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

function buildFallbackEmailBody(customer: { name: string }, reasonString: string, tone: Tone, eventName: string | null): string {
  const secondParagraph =
    tone === "discount"
      ? "We would love to help you get more value. As a welcome-back offer, we can provide a limited-time discount on your next billing cycle if you reactivate this week."
      : tone === "event" && eventName
        ? `Since today is ${eventName}, we wanted to reach out personally and make it easy to reconnect.`
        : "We would love to help you get more value. If helpful, we can offer a short onboarding refresh plus a time-bound incentive to support reactivation.";

  return [
    `Hi ${customer.name},`,
    "",
    `We wanted to check in because ${reasonString}.`,
    "",
    secondParagraph,
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

  const requestBody = await request.json();
  const customerId = typeof requestBody?.customerId === "string" ? requestBody.customerId : "";
  const tone: Tone = isTone(requestBody?.tone) ? requestBody.tone : "professional";
  const eventNameInput = typeof requestBody?.eventName === "string" ? requestBody.eventName.trim() : "";
  if (!customerId) return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
  if (tone === "event" && !eventNameInput) {
    return NextResponse.json({ error: "Missing event name for event-based tone" }, { status: 400 });
  }

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
  if (!hasGeminiApiKey()) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
  }

  const riskReasons: string[] = [];
  if (dynamicDaysInactive > 14) riskReasons.push(`has not logged in for ${dynamicDaysInactive} days`);
  if (Number(customer.usage_drop) > 0.2) riskReasons.push(`usage dropped by ${Math.round(Number(customer.usage_drop) * 100)}%`);
  if (customer.support_complaints > 0) riskReasons.push(`has ${customer.support_complaints} unresolved support ticket(s)`);
  if (customer.payment_delay) riskReasons.push("has a delayed payment");

  const reasonString = riskReasons.length > 0 ? riskReasons.join(", ") : "shows signs of disengagement";
  const eventName = tone === "event" ? eventNameInput : null;

  const prompt = buildPrompt(tone, customer.name, reasonString, eventName);
  const subject = getSubjectForTone(tone, eventName);
  let emailBody = "";
  let source: "gemini" | "fallback" = "gemini";

  try {
    const generatedBody = await generateGeminiText(prompt, { timeoutMs: GENERATION_TIMEOUT_MS });
    emailBody = sanitizeEmailBody(generatedBody, customer.company);
  } catch {
    source = "fallback";
    emailBody = buildFallbackEmailBody(customer, reasonString, tone, eventName);
  }

  const draftResult = await upsertOutreachDraft(supabase, user.id, customerId, {
    to_email: customer.email,
    subject,
    body: emailBody,
  });

  if (!draftResult.ok) {
    return NextResponse.json({ error: draftResult.error }, { status: draftResult.status });
  }

  return NextResponse.json({ subject, body: emailBody, toEmail: customer.email, source });
}
