import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeDaysInactiveFromLastLogin } from "@/lib/inactivity";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level");
  const limit = parseInt(searchParams.get("limit") ?? "500");
  const search = searchParams.get("search") ?? "";

  let query = supabase
    .from("customers")
    .select("id, name, email, company, industry, last_login_at, days_inactive, usage_drop, support_complaints, payment_delay, risk_score, risk_level, ai_explanation, created_at")
    .eq("user_id", user.id)
    .order("risk_score", { ascending: false })
    .limit(limit);

  if (level) query = query.eq("risk_level", level);
  if (search) {
    const q = search.replaceAll(",", " ");
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const customers = (data ?? []).map((customer) => ({
    ...customer,
    days_inactive: computeDaysInactiveFromLastLogin(customer.last_login_at, customer.days_inactive),
  }));

  return NextResponse.json({ customers });
}

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { count, error: countErr } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countErr) {
    return NextResponse.json({ error: countErr.message }, { status: 500 });
  }

  const { error: deleteErr } = await supabase
    .from("customers")
    .delete()
    .eq("user_id", user.id);

  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted: count ?? 0 });
}
