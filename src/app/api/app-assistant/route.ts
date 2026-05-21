import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

type ChatTurn = { role: "user" | "assistant"; content: string };

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
3) App computes churn score per customer using four factors.
4) Review high-risk customers in Risk Analysis and Dashboard widgets.
5) Draft and send retention emails in Outreach Hub.

Scoring formula used by the app:
- Inputs: inactivity days, usage drop ratio, unresolved support complaints, payment delay flag.
- Weights are user-configurable in Settings.
- Default weights are 25% each.
- Normalized weighted scoring:
  Score = ((w1*x1 + w2*x2 + w3*x3 + w4*x4) / (w1 + w2 + w3 + w4)) * 100
- Signal normalization:
  x1 = min(daysInactive / 90, 1)
  x2 = clamp(usageDrop, 0, 1)
  x3 = min(supportComplaints / 10, 1)
  x4 = paymentDelay (0 or 1)
- Risk bands:
  high >= 70, medium >= 40 and < 70, low < 40

Data guidance:
- CSV supports mapped columns (name/email/company and scoring signals).
- Upload processing reads user settings and applies saved weights.

Response behavior:
- Answer only app-related questions (features, workflow, settings, formula, navigation).
- If question is outside app functionality, say you can only help with ChurnGuard AI usage.
- Keep responses practical and concise.
- Format answers in Markdown:
  - use short section headers when useful,
  - use bullet points or numbered steps for instructions,
  - use **bold**, *italics*, and `inline code` for emphasis (for routes, use inline code).
`;

function getRuleBasedAnswer(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("formula") || q.includes("weight") || q.includes("prediction") || q.includes("score")) {
    return [
      "The churn prediction score uses 4 signals with configurable weights.",
      "",
      "Default setup: 25% each (inactivity, usage drop, support complaints, payment delay).",
      "",
      "How it works:",
      "1) Each signal is normalized to 0-1.",
      "2) The app computes a weighted average and multiplies by 100.",
      "3) Final bands are high (>=70), medium (40-69), and low (<40).",
      "",
      "Formula:",
      "Score = ((w1*x1 + w2*x2 + w3*x3 + w4*x4) / (w1+w2+w3+w4)) * 100",
      "",
      "You can adjust weights in Settings, and the formula will automatically normalize by total weight.",
    ].join("\n");
  }

  if (q.includes("upload") || q.includes("csv") || q.includes("data")) {
    return [
      "To upload customer data:",
      "1) Open Data Management.",
      "2) Upload your CSV.",
      "3) Map detected columns (name, email, inactivity, usage, support, payment).",
      "4) Confirm import.",
      "",
      "The app then calculates churn scores for each customer using your saved settings weights.",
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

  if (q.includes("setting") || q.includes("industry")) {
    return [
      "In Settings you can:",
      "- Select your industry profile.",
      "- Tune the four scoring weights.",
      "- Review the live formula transparency panel.",
      "- Save or reset settings to defaults.",
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

    const prompt = `
${APP_KNOWLEDGE_BASE}

Conversation history:
${conversationText || "(no previous history)"}

User question:
${trimmedQuestion}

Write a clear, practical response focused on app functionality.
Do not invent non-existent screens or features.
Format the final response as Markdown with readable structure.
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim();

    return NextResponse.json({ answer: answer || fallback, source: "gemini" });
  } catch {
    return NextResponse.json({ answer: fallback, source: "rules" });
  }
}
