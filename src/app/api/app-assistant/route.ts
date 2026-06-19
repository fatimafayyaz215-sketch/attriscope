import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeDaysInactiveFromLastLogin } from "@/lib/inactivity";
import { generateGeminiText, hasGeminiApiKey } from "@/lib/gemini";

type ChatTurn = { role: "user" | "assistant"; content: string };

const ASSISTANT_TIMEOUT_MS = 12000;
const ASSISTANT_MAX_OUTPUT_TOKENS = 400;

const APP_KNOWLEDGE_BASE = `You are Attriscope's in-product assistant.

Routes: /dashboard, /risk-analysis, /outreach-hub, /data-management, /settings.
Workflow: onboarding → CSV upload → risk scores (0-100) → Risk Analysis → Outreach Hub.

Risk Analysis filters only: search; risk level (High/Medium/Low); key signal (Inactivity, Usage Drop, Support Complaints, Payment Delay). Deep links e.g. /risk-analysis?level=high&signal=payment. Key Factor = strongest signal per row.

Scoring: 4 signals (inactivity, usage drop, support, payment delay); billing caps — monthly: 28d inactivity, 5 tickets; yearly: 85d, 9 tickets. Weights in Settings. Presets: SaaS 20/30/30/20, Entertainment 30/30/20/20, Education 35/25/15/25. Bands: High ≥70, Medium 40-69, Low <40.

CSV: customer_id, name, email, company, last_login_at, current_sessions, previous_sessions, support_complaints, payment_delay, billing_cycle (auto-mapped).

Rules: App help only. No internal formula math. Be concise (under ~120 words). Use **bold**, bullets, \`routes\` — no ### or ***.`;

/** Returns a canned answer for common FAQs, or null when Gemini should handle the question. */
function tryRuleBasedAnswer(question: string): string | null {
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
      "**How Attriscope scores churn risk:**",
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
      "**Weights:** SaaS preset (default): inactivity 20%, usage 30%, support 30%, payment 20%. Adjust in `Settings` or use Reset to Default for your industry profile.",
      "If all 4 matter equally for your business → set each to 25%.",
    ].join("\n");
  }

  if (q.includes("upload") || q.includes("csv") || q.includes("import") || q.includes("column") || (q.includes("data") && !q.includes("customer"))) {
    return [
      "**To upload customer data:**",
      "1) Open `Data Management`.",
      "2) Upload your CSV file.",
      "3) Column names are auto-detected — review and adjust the mapping if needed.",
      "4) Click **Process Data** to import.",
      "",
      "**Supported columns:** `customer_id`, `name`, `email`, `company`, `last_login_at`, `current_sessions`, `previous_sessions`, `support_complaints`, `payment_delay`, `billing_cycle`.",
      "",
      "**Tips:**",
      "- Provide `last_login_at` and the app calculates inactivity automatically.",
      "- `billing_cycle` accepts: monthly (or month / mo / mth) and yearly. Defaults to yearly if missing.",
      "- Scores use your saved weight settings from `Settings`.",
    ].join("\n");
  }

  if (q.includes("outreach") || (q.includes("email") && !q.includes("column"))) {
    return [
      "Use Outreach Hub for retention emails:",
      "1) Select a customer from Risk Analysis (or from query parameter navigation).",
      "2) Generate an AI draft.",
      "3) Choose tone, edit content, save draft, and send.",
    ].join("\n");
  }

  if (
    q.includes("payment delay") ||
    q.includes("payment_delay") ||
    q.includes("payment friction") ||
    (q.includes("payment") && (q.includes("save") || q.includes("flag") || q.includes("filter")))
  ) {
    return [
      "**Find customers with payment delays:**",
      "1) Open `Risk Analysis` (`/risk-analysis`).",
      "2) Set **Key signal** to **Payment Delay** (optionally set **High Risk** too).",
      "3) Review the filtered list — Key Factor may show **Payment delayed**.",
      "4) Click a customer, then use **Outreach →** to draft a retention email.",
      "",
      "**Deep link:** `/risk-analysis?signal=payment` or `/risk-analysis?level=high&signal=payment`",
    ].join("\n");
  }

  if (
    q.includes("usage drop") ||
    q.includes("support complaint") ||
    q.includes("support ticket") ||
    (q.includes("inactivity") && (q.includes("filter") || q.includes("signal")))
  ) {
    const signal =
      q.includes("usage") ? "usage"
      : q.includes("support") || q.includes("ticket") || q.includes("complaint") ? "support"
      : "inactivity";
    const label =
      signal === "usage" ? "Usage Drop"
      : signal === "support" ? "Support Complaints"
      : "Inactivity";
    return [
      `**Filter by ${label}:**`,
      "1) Open `Risk Analysis`.",
      `2) Set **Key signal** to **${label}**.`,
      "3) Optionally combine with a **risk level** filter (e.g. High Risk).",
      "4) Select a customer and use **Outreach →** for targeted retention.",
      "",
      `**Deep link:** \`/risk-analysis?signal=${signal}\``,
    ].join("\n");
  }

  if (q.includes("risk analysis") || q.includes("high risk") || q.includes("dashboard")) {
    return [
      "Use Dashboard and Risk Analysis together:",
      "- Dashboard gives KPI and trend summaries.",
      "- Risk Analysis has **search**, **risk level** filter, and **key signal** filter (inactivity, usage drop, support, payment delay).",
      "- High-risk customers are the best candidates for Outreach Hub campaigns.",
      "- Example: `/risk-analysis?level=high&signal=payment` for high-risk accounts with payment delays.",
    ].join("\n");
  }

  if (q.includes("setting") || q.includes("industry") || q.includes("reset") || q.includes("default")) {
    return [
      "**In Settings you can:**",
      "- Select your **industry profile**.",
      "- Tune the **four scoring weights** using sliders.",
      "- Review the live **signal priority panel** to see current weight distribution.",
      "- **Save** your weights to apply them to future uploads.",
      "- **Reset to Default** to restore your industry profile (SaaS: 20/30/30/20).",
      "",
      "**Weight tips:**",
      "- All 4 signals equally important → set each to **25%**.",
      "- One signal matters more → raise that slider above the others.",
      "- Total is recommended to be 100%.",
    ].join("\n");
  }

  return null;
}

function getRuleBasedFallback(): string {
  return "I can help with Attriscope features like onboarding, data upload, scoring formula, risk analysis, outreach emails, and settings. Ask me a specific workflow or screen question.";
}

function needsCustomerAnalysisContext(question: string): boolean {
  const q = question.toLowerCase();

  if (
    /\b(csv|upload|import|column|mapping|setting|weight|industry|onboarding|how do i|how to|where is|what is|navigate|workflow|route|page|screen|tab)\b/.test(q)
  ) {
    return false;
  }

  return /\b(customer|customers|churn|at[- ]risk|high[- ]risk|who should|re-?engage|retention campaign|my account)\b/.test(q);
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
  const ruleAnswer = tryRuleBasedAnswer(trimmedQuestion);

  if (ruleAnswer) {
    return NextResponse.json({ answer: ruleAnswer, source: "rules" });
  }

  const fallback = getRuleBasedFallback();

  if (!hasGeminiApiKey()) {
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

    let recentAnalysisContext = "";
    if (needsCustomerAnalysisContext(trimmedQuestion)) {
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
              const shortAnalysis = (c.ai_explanation ?? "").replace(/\s+/g, " ").slice(0, 80);
              return `${idx + 1}. ${c.name} (${c.risk_level?.toUpperCase()} ${c.risk_score}/100) inactive ${dynamicDays}d, usage ${usagePct}%, support ${c.support_complaints}, payment ${c.payment_delay ? "yes" : "no"}. ${shortAnalysis}`;
            })
            .join("\n")
        : "(No recent AI analyses yet.)";
    }

    const prompt = `${APP_KNOWLEDGE_BASE}

${conversationText ? `History:\n${conversationText}\n` : ""}${recentAnalysisContext ? `Recent analyses:\n${recentAnalysisContext}\n` : ""}Question: ${trimmedQuestion}

Answer practically. Do not invent features. Risk Analysis filters: search, risk level, key signal only.`;

    const answer = (
      await generateGeminiText(prompt, {
        timeoutMs: ASSISTANT_TIMEOUT_MS,
        maxOutputTokens: ASSISTANT_MAX_OUTPUT_TOKENS,
      })
    ).trim();

    return NextResponse.json({ answer: answer || fallback, source: "gemini" });
  } catch {
    return NextResponse.json({ answer: fallback, source: "rules" });
  }
}
