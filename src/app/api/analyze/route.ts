import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

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
    .select("*")
    .eq("id", customerId)
    .eq("user_id", user.id)
    .single();

  if (custErr || !customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `You are a customer success expert. Analyse this at-risk customer and explain in 2–3 plain-English sentences why they are likely to churn. Be specific and actionable. Do NOT use markdown.

Customer: ${customer.name} (${customer.company || "unknown company"})
Risk Score: ${customer.risk_score}/100 (${customer.risk_level.toUpperCase()} risk)
Days since last login: ${customer.days_inactive}
Usage drop: ${Math.round(Number(customer.usage_drop) * 100)}%
Open support complaints: ${customer.support_complaints}
Payment delayed: ${customer.payment_delay ? "Yes" : "No"}

Write the explanation as if speaking directly to the business owner.`;

  try {
    const result = await model.generateContent(prompt);
    const explanation = result.response.text();

    // Persist the explanation
    await supabase.from("customers").update({ ai_explanation: explanation }).eq("id", customerId);

    return NextResponse.json({ explanation });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gemini request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
