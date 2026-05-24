import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { computeDaysInactiveFromLastLogin } from "@/lib/inactivity";

type ChatTurn = { role: "user" | "assistant"; content: string };

const GEMINI_MODELS = ["gemini-2.5-flash-lite", "gemini-3.1-flash-lite"] as const;
const ASSISTANT_TIMEOUT_MS = 12000;

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
            setTimeout(() => reject(new Error("Assistant generation timed out")), ASSISTANT_TIMEOUT_MS),
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

const APP_KNOWLEDGE_BASE = `
You are the in-product assistant for ChurnGuard AI.

Product areas and routes:
- Dashboard overview: /dashboard
- Risk analysis workspace: /risk-analysis
- Outreach Hub (AI email drafting): /outreach-hub
- Data import and mapping: /data-management
- Settings (industry + weights): /settings

Main workflow:
1) Onboarding: pick industry, calibrate weights, connect/import data.
2) Upload CSV in Data Management.
3) App computes a churn risk score (0-100) per customer using four signals.
4) Review high-risk customers in Risk Analysis and Dashboard widgets.
5) Draft and send retention emails in Outreach Hub.

How scoring works:
- Four signals are measured: Login/Inactivity, Usage Drop, Support Complaints, Payment Delay.
- Each signal is normalized based on the customer's billing cycle before scoring.
- Billing cycle caps (monthly plan): inactivity capped at 28 days, support tickets capped at 5.
- Billing cycle caps (yearly plan): inactivity capped at 85 days, support tickets capped at 9.
- This ensures monthly and yearly customers are judged fairly on the same scale.
- If billing_cycle column is not in the CSV, the system defaults to yearly caps.
- Weights are user-configurable in Settings (default: 25% each = equal priority).
- Risk bands: High >= 70, Medium 40-69, Low < 40.

Weight / priority guidance:
- The four signals each have a weight slider in Settings.
- If all four signals matter equally, set each to 25%.
- If one signal (e.g. payment delay) is the biggest churn indicator for the business, raise that slider higher.
- Total recommended to be 100%, but the formula self-adjusts even if it isn't.
- Use Reset to Default anytime to return to 25% / 25% / 25% / 25%.

CSV upload guidance:
- Supported columns: customer_id, name, email, company, last_login_at, current_sessions, previous_sessions, support_complaints, payment_delay, billing_cycle.
- Column names are auto-detected — common naming variations are handled automatically.
- Inactivity is derived from last_login_at at read time.
- billing_cycle values: monthly (also accepts: month, mo, mth); anything else defaults to yearly.

Response behavior:
- Answer only app-related questions (features, workflow, settings, scoring, navigation).
- Do NOT expose or explain the internal scoring formula equation.
- Explain scoring in plain language: signals, weights, billing cycle fairness, risk bands.
- When asked how to re-engage inactive or high-risk customers, provide actionable plays (offer types, cadence, channels, and follow-up steps).
- Use recent churn analyses from this workspace as context when available, and reference concrete risk signals.
- If question is outside app functionality, say you can only help with ChurnGuard AI usage.
- Keep responses practical and concise.
- Format answers in Markdown:
  - use short section headers when useful,
  - use bullet points or numbered steps for instructions,
  - use **bold**, *italics*, and \`inline code\` for emphasis (for routes, use inline code).
`;

function getRuleBasedAnswer(question: string): string {
  const q = question.toLowerCase();

  if (
    q.includes("inactive") ||
    q.includes("re-engage") ||
    q.includes("bring back") ||
    q.includes("retention") ||
    q.includes("offer") ||
    q.includes("voucher") ||
    q.includes("discount") ||
    q.includes("loyalty")
  ) {
    return [
      "**Customer Re-engagement Playbook**",
      "",
      "Use this 3-step flow for inactive or high-risk customers:",
      "1) **Segment by reason**: inactivity, usage drop, support issues, or payment friction.",
      "2) **Match the offer to the reason**:",
      "- Inactivity: time-limited voucher, monthly discount, or reactivation bonus.",
      "- Usage drop: feature-specific onboarding, personalized walkthrough, success check-in.",
      "- Support complaints: priority support callback + issue-resolution incentive.",
      "- Payment delay: flexible plan options, grace extension, billing reminder campaign.",
      "3) **Run a follow-up cadence**: Day 0 email, Day 3 reminder, Day 7 final personalized outreach.",
      "",
      "**Best practice:** personalize message tone and offer value by risk level, then track response and conversion in Outreach Hub.",
    ].join("\n");
  }

  if (q.includes("formula") || q.includes("weight") || q.includes("prediction") || q.includes("score") || q.includes("billing") || q.includes("cycle")) {
    return [
      "**How ChurnGuard AI scores churn risk:**",
      "",
      "Each customer gets a **Risk Score from 0 to 100** based on 4 signals:",
      "- **Login / Inactivity** — days since last login",
      "- **Usage Drop** — decline in sessions vs previous period",
      "- **Support Complaints** — number of unresolved support tickets",
      "- **Payment Delay** — late or missed payment (yes/no)",
      "",
      "**Billing Cycle Fairness:**",
      "Scoring caps adjust based on the customer's plan so monthly and yearly customers are judged fairly:",
      "- Monthly plan: inactivity cap = 28 days, support cap = 5 tickets",
      "- Yearly plan: inactivity cap = 85 days, support cap = 9 tickets",
      "",
      "**Risk levels:** High ≥ 70 · Medium 40–69 · Low < 40",
      "",
      "**Weights:** Default is 25% each. Adjust in `Settings` based on what signals churn in your business.",
      "If all 4 matter equally → keep each at 25%.",
    ].join("\n");
  }

  if (q.includes("upload") || q.includes("csv") || q.includes("data") || q.includes("import") || q.includes("column")) {
    return [
      "**To upload customer data:**",
      "1) Open `Data Management`.",
      "2) Upload your CSV file.",
      "3) Column names are auto-detected — review and adjust the mapping if needed.",
      "4) Click **Process Data** to import.",
      "",
      "**Supported columns:** customer\_id, name, email, company, last\_login\_at, current\_sessions, previous\_sessions, support\_complaints, payment\_delay, billing\_cycle.",
      "",
      "**Tips:**",
      "- Provide `last_login_at` and the app calculates inactivity automatically.",
      "- `billing_cycle` accepts: monthly (or month / mo / mth) and yearly. Defaults to yearly if missing.",
      "- Scores use your saved weight settings from `Settings`.",
    ].join("\n");
  }

  if (q.includes("outreach") || q.includes("email")) {
    return [
      "Use Outreach Hub for retention emails:",
      "1) Select a customer from Risk Analysis (or from query parameter navigation).",
      "2) Generate an AI draft.",
      "3) Choose tone, edit content, save draft, and send.",
    ].join("\n");
  }

  if (q.includes("risk analysis") || q.includes("high risk") || q.includes("dashboard")) {
    return [
      "Use Dashboard and Risk Analysis together:",
      "- Dashboard gives KPI and trend summaries.",
      "- Risk Analysis provides row-level customer risk details and filtering.",
      "- High-risk customers are the best candidates for Outreach Hub campaigns.",
    ].join("\n");
  }

  if (q.includes("setting") || q.includes("industry") || q.includes("reset") || q.includes("default")) {
    return [
      "**In Settings you can:**",
      "- Select your **industry profile**.",
      "- Tune the **four scoring weights** using sliders.",
      "- Review the live **signal priority panel** to see current weight distribution.",
      "- **Save** your weights to apply them to future uploads.",
      "- **Reset to Default** to restore all weights to 25% each (equal priority).",
      "",
      "**Weight tips:**",
      "- All 4 signals equally important → set each to **25%**.",
      "- One signal matters more → raise that slider above the others.",
      "- Total is recommended to be 100%.",
    ].join("\n");
  }

  return "I can help with ChurnGuard AI features like onboarding, data upload, scoring formula, risk analysis, outreach emails, and settings. Ask me a specific workflow or screen question.";
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { question, history } = (await request.json()) as {
    question?: string;
    history?: ChatTurn[];
  };

  if (!question || typeof question !== "string") {
    return NextResponse.json({ error: "Missing question" }, { status: 400 });
  }

  const trimmedQuestion = question.trim();
  const fallback = getRuleBasedAnswer(trimmedQuestion);
  const lowerQuestion = trimmedQuestion.toLowerCase();
  const needsAnalysisContext = /(churn|risk|inactive|inactivity|re-?engage|retention|offer|voucher|discount|loyalty|campaign|customer)/i.test(lowerQuestion);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ answer: fallback, source: "rules" });
  }

  try {
    const safeHistory = Array.isArray(history)
      ? history
          .filter((h) => (h.role === "user" || h.role === "assistant") && typeof h.content === "string")
          .slice(-6)
      : [];

    const conversationText = safeHistory
      .map((h) => `${h.role.toUpperCase()}: ${h.content}`)
      .join("\n");

    let recentAnalysisContext = "(Recent analysis context skipped for this question type.)";
    if (needsAnalysisContext) {
      const { data: recentAnalyses } = await supabase
        .from("customers")
        .select("name, risk_score, risk_level, last_login_at, days_inactive, usage_drop, support_complaints, payment_delay, ai_explanation, created_at")
        .eq("user_id", user.id)
        .not("ai_explanation", "is", null)
        .order("created_at", { ascending: false })
        .limit(4);

      recentAnalysisContext = (recentAnalyses ?? []).length > 0
        ? (recentAnalyses ?? [])
            .map((c, idx) => {
              const usagePct = Math.round(Number(c.usage_drop ?? 0) * 100);
              const dynamicDays = computeDaysInactiveFromLastLogin(c.last_login_at, c.days_inactive);
              const shortAnalysis = (c.ai_explanation ?? "").replace(/\s+/g, " ").slice(0, 140);
              return `${idx + 1}. ${c.name} (${c.risk_level?.toUpperCase()} ${c.risk_score}/100) - inactive ${dynamicDays}d, usage ${usagePct}%, support ${c.support_complaints}, payment ${c.payment_delay ? "yes" : "no"}. Analysis: ${shortAnalysis}`;
            })
            .join("\n")
        : "(No recent AI analyses available yet. Ask user to run analysis in Risk Analysis if needed.)";
    }

    const prompt = `
${APP_KNOWLEDGE_BASE}

Conversation history:
${conversationText || "(no previous history)"}

Recent churn analyses (most recent first):
${recentAnalysisContext}

User question:
${trimmedQuestion}

Write a clear, practical response focused on app functionality.
Do not invent non-existent screens or features.
When relevant, give concrete re-engagement recommendations (offers, campaigns, and next-step actions).
Format the final response as Markdown with readable structure.
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const answer = (await generateGeminiTextWithFallback(genAI, prompt)).trim();

    return NextResponse.json({ answer: answer || fallback, source: "gemini" });
  } catch {
    return NextResponse.json({ answer: fallback, source: "rules" });
  }
}
