import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { customerId, subject, body, toEmail } = await request.json();
  if (!customerId) return NextResponse.json({ error: "Missing customerId" }, { status: 400 });

  // Mark any existing draft as sent, or insert a new sent record
  const { data: existing } = await supabase
    .from("outreach_emails")
    .select("id")
    .eq("user_id", user.id)
    .eq("customer_id", customerId)
    .eq("status", "draft")
    .single();

  if (existing?.id) {
    await supabase
      .from("outreach_emails")
      .update({ status: "sent", sent_at: new Date().toISOString(), subject, body })
      .eq("id", existing.id);
  } else {
    await supabase.from("outreach_emails").insert({
      user_id: user.id,
      customer_id: customerId,
      to_email: toEmail ?? "",
      subject: subject ?? "",
      body: body ?? "",
      status: "sent",
      sent_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ success: true });
}
