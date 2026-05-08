import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Aggregate counts by risk level
  const { data: customers, error } = await supabase
    .from("customers")
    .select("risk_level, risk_score, days_inactive, usage_drop, created_at")
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = customers?.length ?? 0;
  const high = customers?.filter((c) => c.risk_level === "high").length ?? 0;
  const medium = customers?.filter((c) => c.risk_level === "medium").length ?? 0;
  const low = customers?.filter((c) => c.risk_level === "low").length ?? 0;
  const avgScore = total > 0
    ? Math.round(customers!.reduce((s, c) => s + Math.max(0, Number(c.risk_score) || 0), 0) / total)
    : 0;

  // Weekly engagement trend (last 4 weeks, based on avg usage_drop per week-bucket)
  // We bucket customers by their days_inactive into 4 weekly bins
  const trend = [1, 2, 3, 4].map((week) => {
    const minDays = (week - 1) * 7;
    const maxDays = week * 7;
    const bucket = customers?.filter((c) => c.days_inactive >= minDays && c.days_inactive < maxDays) ?? [];
    const avgDrop = bucket.length > 0
      ? bucket.reduce((s, c) => s + Number(c.usage_drop), 0) / bucket.length
      : 0;
    // engagement = 1 - avg_usage_drop, as a percentage
    return { week: `Week ${week}`, engagement: Math.round((1 - avgDrop) * 100), count: bucket.length };
  });

  return NextResponse.json({ total, high, medium, low, avgScore, trend });
}
