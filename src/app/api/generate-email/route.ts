import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

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

  // Fetch sender's profile (auth user email as fallback sender name)
  const { data: authUser } = await supabase.auth.getUser();
  const senderEmail = authUser.user?.email ?? "the team";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const riskReasons: string[] = [];
  if (customer.days_inactive > 14) riskReasons.push(`has not logged in for ${customer.days_inactive} days`);
  if (Number(customer.usage_drop) > 0.2) riskReasons.push(`usage dropped by ${Math.round(Number(customer.usage_drop) * 100)}%`);
  if (customer.support_complaints > 0) riskReasons.push(`has ${customer.support_complaints} unresolved support ticket(s)`);
  if (customer.payment_delay) riskReasons.push("has a delayed payment");

  const reasonString = riskReasons.length > 0 ? riskReasons.join(", ") : "shows signs of disengagement";

  const prompt = `Write a ${tone} retention email to win back an at-risk customer. The email should be warm, specific, and offer a clear next step.

Customer name: ${customer.name}
Company: ${customer.company || "their organisation"}
Risk indicators: ${reasonString}
Sender: Your Customer Success Team

Rules:
- Keep it under 200 words
- Personalise it with the specific risk indicators
- End with a clear call to action (book a call, reply, etc.)
- Do NOT use placeholder brackets like [Name] — use the actual values
- Plain text only, no markdown`;

  try {
    const result = await model.generateContent(prompt);
    const body = result.response.text();

    const subject = `Checking in on your ${customer.company || "account"} — quick question`;

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

    return NextResponse.json({ subject, body, toEmail: customer.email });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gemini request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
