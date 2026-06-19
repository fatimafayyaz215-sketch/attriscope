import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  assertCustomerOwnedByUser,
  isValidEmail,
  stripHtml,
  upsertOutreachDraft,
} from "@/lib/outreach-email";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customerId = request.nextUrl.searchParams.get("customerId")?.trim() ?? "";
  if (!customerId) {
    return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
  }

  const owned = await assertCustomerOwnedByUser(supabase, user.id, customerId);
  if (!owned.ok) {
    return NextResponse.json({ error: owned.error }, { status: owned.status });
  }

  const { data, error } = await supabase
    .from("outreach_emails")
    .select("id, to_email, subject, body, created_at")
    .eq("user_id", user.id)
    .eq("customer_id", customerId)
    .eq("status", "draft")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ draft: null });
  }

  return NextResponse.json({
    draft: {
      id: data.id,
      toEmail: data.to_email,
      subject: data.subject,
      body: data.body,
      savedAt: data.created_at,
    },
  });
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

  const body = await request.json();
  const customerId = typeof body?.customerId === "string" ? body.customerId.trim() : "";
  const toEmail = typeof body?.toEmail === "string" ? body.toEmail.trim() : "";
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const emailBody = typeof body?.body === "string" ? body.body.trim() : "";

  if (!customerId) {
    return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
  }
  if (!toEmail || !isValidEmail(toEmail)) {
    return NextResponse.json({ error: "A valid recipient email is required." }, { status: 400 });
  }
  if (!subject) {
    return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  }
  if (!stripHtml(emailBody)) {
    return NextResponse.json({ error: "Email body is required." }, { status: 400 });
  }

  const result = await upsertOutreachDraft(supabase, user.id, customerId, {
    to_email: toEmail,
    subject,
    body: emailBody,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const savedAt = new Date().toISOString();
  return NextResponse.json({
    success: true,
    id: result.id,
    savedAt,
  });
}
