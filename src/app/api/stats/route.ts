import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeDaysInactiveFromLastLogin } from "@/lib/inactivity";
import { computeCustomerEngagement } from "@/lib/scoring";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Aggregate counts by risk level
  const { data: customers, error } = await supabase
    .from("customers")
    .select("risk_level, risk_score, days_inactive, last_login_at, usage_drop, created_at")
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = customers?.length ?? 0;
  const high = customers?.filter((c) => c.risk_level === "high").length ?? 0;
  const medium = customers?.filter((c) => c.risk_level === "medium").length ?? 0;
  const low = customers?.filter((c) => c.risk_level === "low").length ?? 0;
  const avgScore = total > 0
    ? Math.round(customers!.reduce((s, c) => s + Math.max(0, Number(c.risk_score) || 0), 0) / total)
    : 0;

  const withDynamicInactivity = (customers ?? []).map((c) => ({
    ...c,
    days_inactive: computeDaysInactiveFromLastLogin(c.last_login_at, c.days_inactive),
  }));

  // Engagement trend: bucket by inactivity windows (covers monthly + yearly caps up to 90d)
  const INACTIVITY_BUCKETS = [
    { week: "0–7d", min: 0, max: 7 },
    { week: "8–30d", min: 8, max: 30 },
    { week: "31–60d", min: 31, max: 60 },
    { week: "61–90d", min: 61, max: Infinity },
  ] as const;

  const trend = INACTIVITY_BUCKETS.map(({ week, min, max }) => {
    const bucket = withDynamicInactivity.filter((c) => {
      const days = c.days_inactive;
      return days >= min && (max === Infinity ? true : days <= max);
    });
    const engagement =
      bucket.length > 0
        ? Math.round(
            bucket.reduce(
              (s, c) => s + computeCustomerEngagement(c.days_inactive, Number(c.usage_drop)),
              0,
            ) / bucket.length,
          )
        : 0;
    return { week, engagement, count: bucket.length };
  });

  return NextResponse.json({ total, high, medium, low, avgScore, trend });
}
