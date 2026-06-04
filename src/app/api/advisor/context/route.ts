import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeIndustry } from "@/lib/industry-defaults";
import type { Industry } from "@/lib/industry";

export const dynamic = "force-dynamic";

const INDUSTRY_LABEL: Record<Industry, string> = {
  saas: "SaaS",
  entertainment: "Entertainment",
  education: "Education",
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const [{ data: settings }, { data: customers, error: custErr }] = await Promise.all([
    supabase.from("user_settings").select("industry").eq("user_id", user.id).single(),
    supabase.from("customers").select("risk_level").eq("user_id", user.id),
  ]);

  if (custErr) {
    return NextResponse.json({ message: custErr.message }, { status: 500 });
  }

  const industry = normalizeIndustry(settings?.industry) as Industry;
  const rows = customers ?? [];
  const totalCustomers = rows.length;
  const highRiskCustomers = rows.filter((c) => c.risk_level === "high").length;

  return NextResponse.json({
    industry,
    industryLabel: INDUSTRY_LABEL[industry],
    metrics: {
      totalCustomers,
      churnCustomers: highRiskCustomers,
      highRiskCustomers,
      revenueAtRiskMrr: 0,
    },
  });
}
