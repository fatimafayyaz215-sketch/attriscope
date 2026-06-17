import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import {
  getResendFromAddress,
  resolveResendDeliveryAddress,
} from "@/lib/resend-config";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
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

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email service is not configured. Add RESEND_API_KEY to .env.local." },
      { status: 503 },
    );
  }

  const { customerId, subject, body, toEmail } = await request.json();
  if (!customerId) {
    return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
  }

  const intendedRecipient = (toEmail ?? "").trim();
  if (!intendedRecipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(intendedRecipient)) {
    return NextResponse.json({ error: "A valid recipient email is required." }, { status: 400 });
  }

  const emailSubject = (subject ?? "").trim();
  if (!emailSubject) {
    return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  }

  const emailBody = (body ?? "").trim();
  if (!stripHtml(emailBody)) {
    return NextResponse.json({ error: "Email body is required." }, { status: 400 });
  }

  const from = getResendFromAddress();
  const { deliverTo, testMode, testRecipient } = resolveResendDeliveryAddress(intendedRecipient);

  if (testMode && !testRecipient) {
    return NextResponse.json(
      {
        error:
          "Resend test mode requires RESEND_TEST_RECIPIENT in .env.local (your Resend account email, e.g. fatimafayyaz215@gmail.com).",
      },
      { status: 503 },
    );
  }

  const resend = new Resend(apiKey);

  const { data: sendData, error: sendError } = await resend.emails.send({
    from,
    to: [deliverTo],
    subject: emailSubject,
    html: emailBody,
    text: stripHtml(emailBody),
  });

  if (sendError) {
    console.error("[send-email] Resend error:", sendError);
    return NextResponse.json(
      { error: sendError.message || "Failed to send email." },
      { status: 502 },
    );
  }

  const { data: existing } = await supabase
    .from("outreach_emails")
    .select("id")
    .eq("user_id", user.id)
    .eq("customer_id", customerId)
    .eq("status", "draft")
    .maybeSingle();

  if (existing?.id) {
    await supabase
      .from("outreach_emails")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        subject: emailSubject,
        body: emailBody,
        to_email: intendedRecipient,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("outreach_emails").insert({
      user_id: user.id,
      customer_id: customerId,
      to_email: intendedRecipient,
      subject: emailSubject,
      body: emailBody,
      status: "sent",
      sent_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ success: true, messageId: sendData?.id ?? null });
}
