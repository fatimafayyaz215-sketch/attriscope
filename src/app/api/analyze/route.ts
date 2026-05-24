import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { computeDaysInactiveFromLastLogin } from "@/lib/inactivity";

const GEMINI_MODELS = ["gemini-2.5-flash-lite", "gemini-3.1-flash-lite"] as const;
const GENERATION_TIMEOUT_MS = 7000;

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
        const result = await model.generateContent(prompt);
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

function buildFastFallbackExplanation(customer: {
  days_inactive: number;
  usage_drop: number;
  support_complaints: number;
  payment_delay: number;
  risk_level: string;
}): string {
  const reasons: string[] = [];
  if (customer.days_inactive > 14) reasons.push(`the account has been inactive for ${customer.days_inactive} days`);
  if (Number(customer.usage_drop) > 0.2) reasons.push(`usage has dropped by ${Math.round(Number(customer.usage_drop) * 100)}%`);
  if (customer.support_complaints > 0) reasons.push(`there are ${customer.support_complaints} unresolved support issues`);
  if (customer.payment_delay) reasons.push("there is a payment delay");

  const reasonText = reasons.length > 0 ? reasons.join(", ") : "engagement is trending down";
  const level = customer.risk_level.toUpperCase();
  return `This customer is ${level} risk because ${reasonText}. Prioritize immediate outreach with a tailored offer and a short success check-in call this week. If there is no response in 3-5 days, follow up with a time-bound incentive and a support-led reactivation campaign.`;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { customerId } = await request.json();
  if (!customerId) return NextResponse.json({ error: "Missing customerId" }, { status: 400 });

  // Fetch the customer
  const { data: customer, error: custErr } = await supabase
    .from("customers")
    .select("id, name, company, risk_score, risk_level, last_login_at, days_inactive, usage_drop, support_complaints, payment_delay, ai_explanation")
    .eq("id", customerId)
    .eq("user_id", user.id)
    .single();

  if (custErr || !customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const dynamicDaysInactive = computeDaysInactiveFromLastLogin(customer.last_login_at, customer.days_inactive);
  const customerWithDynamicInactivity = { ...customer, days_inactive: dynamicDaysInactive };

  // Fast path: if analysis already exists, return it immediately.
  if (customer.ai_explanation && customer.ai_explanation.trim().length > 0) {
    return NextResponse.json({ explanation: customer.ai_explanation, source: "cached" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `You are a customer success expert. Analyse this at-risk customer and explain in 2–3 plain-English sentences why they are likely to churn. Be specific and actionable. Do NOT use markdown.

Customer: ${customerWithDynamicInactivity.name} (${customerWithDynamicInactivity.company || "unknown company"})
Risk Score: ${customerWithDynamicInactivity.risk_score}/100 (${customerWithDynamicInactivity.risk_level.toUpperCase()} risk)
Days since last login: ${customerWithDynamicInactivity.days_inactive}
Usage drop: ${Math.round(Number(customerWithDynamicInactivity.usage_drop) * 100)}%
Open support complaints: ${customerWithDynamicInactivity.support_complaints}
Payment delayed: ${customerWithDynamicInactivity.payment_delay ? "Yes" : "No"}

Write the explanation as if speaking directly to the business owner.`;

  try {
    const explanation = await Promise.race([
      generateGeminiTextWithFallback(genAI, prompt),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini generation timed out")), GENERATION_TIMEOUT_MS),
      ),
    ]);

    // Persist the explanation
    await supabase.from("customers").update({ ai_explanation: explanation }).eq("id", customerId);

    return NextResponse.json({ explanation, source: "gemini" });
  } catch (err: unknown) {
    const fastFallback = buildFastFallbackExplanation(customerWithDynamicInactivity);
    await supabase.from("customers").update({ ai_explanation: fastFallback }).eq("id", customerId);
    return NextResponse.json({ explanation: fastFallback, source: "fallback" });
  }
}
