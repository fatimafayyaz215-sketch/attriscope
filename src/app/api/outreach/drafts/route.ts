import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("outreach_emails")
    .select(
      `
      id,
      customer_id,
      to_email,
      subject,
      body,
      created_at,
      customers (
        name,
        company,
        risk_level,
        risk_score
      )
    `,
    )
    .eq("user_id", user.id)
    .eq("status", "draft")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const drafts = (data ?? []).map((row) => {
    const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers;

    return {
      id: row.id,
      customerId: row.customer_id,
      customerName: customer?.name ?? "Unknown customer",
      customerCompany: customer?.company ?? "",
      riskLevel: customer?.risk_level ?? "low",
      riskScore: customer?.risk_score ?? 0,
      toEmail: row.to_email,
      subject: row.subject,
      body: row.body,
      savedAt: row.created_at,
    };
  });

  return NextResponse.json({ drafts });
}
