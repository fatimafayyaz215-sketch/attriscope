import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ customers: data ?? [] });
}
