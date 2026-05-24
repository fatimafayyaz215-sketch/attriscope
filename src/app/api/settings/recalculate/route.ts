import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectColumn, type MappedField } from "@/lib/column-detector";
import { BillingCycle, computeChurnScore, DEFAULT_WEIGHTS, type ScoringWeights } from "@/lib/scoring";
import { computeDaysInactiveFromLastLogin } from "@/lib/inactivity";

type Mapping = Record<string, MappedField>;

function parsePaymentDelay(raw: string): 0 | 1 {
  const v = raw.toLowerCase().trim();
  if (v === "1" || v === "true" || v === "yes" || v === "delayed" || v === "late" || v === "missed" || v === "overdue") return 1;
  return 0;
}

function getField(row: Record<string, string>, field: MappedField, mapping: Mapping): string {
  const col = Object.entries(mapping).find(([, v]) => v === field)?.[0];
  return col ? (row[col] ?? "").toString().trim() : "";
}

function buildMappingFromRawData(rawData: unknown): { mapping: Mapping; row: Record<string, string> } {
  const source = rawData && typeof rawData === "object" ? (rawData as Record<string, unknown>) : {};
  const row: Record<string, string> = {};
  const mapping: Mapping = {};

  for (const [key, value] of Object.entries(source)) {
    row[key] = value == null ? "" : String(value);
    const detected = detectColumn(key);
    if (detected !== "ignore" && !Object.values(mapping).includes(detected)) {
      mapping[key] = detected;
    }
  }

  return { mapping, row };
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: settingsRow } = await supabase
    .from("user_settings")
    .select("weight_inactivity, weight_usage, weight_support, weight_payment")
    .eq("user_id", user.id)
    .single();

  const weights: ScoringWeights = settingsRow
    ? {
        inactivity: settingsRow.weight_inactivity,
        usage: settingsRow.weight_usage,
        support: settingsRow.weight_support,
        payment: settingsRow.weight_payment,
      }
    : DEFAULT_WEIGHTS;

  const { data: customers, error: customersErr } = await supabase
    .from("customers")
    .select("id, raw_data, last_login_at, days_inactive")
    .eq("user_id", user.id)
    .limit(10_000);

  if (customersErr) {
    return NextResponse.json({ error: customersErr.message }, { status: 500 });
  }

  if (!customers || customers.length === 0) {
    return NextResponse.json({ updated: 0 });
  }

  let updated = 0;
  for (const customer of customers) {
    const { mapping, row } = buildMappingFromRawData(customer.raw_data);

    const rawLogin = getField(row, "last_login_at", mapping);
    let lastLoginAt: string | null = customer.last_login_at;
    if (rawLogin) {
      const parsed = new Date(rawLogin);
      if (!Number.isNaN(parsed.getTime())) {
        lastLoginAt = parsed.toISOString();
      }
    }

    const rawDays = getField(row, "days_inactive", mapping);
    const rawDaysFallback = Math.max(0, parseInt(rawDays, 10) || 0);
    const daysInactive = computeDaysInactiveFromLastLogin(lastLoginAt, rawDaysFallback || customer.days_inactive);

    const cur = parseFloat(getField(row, "current_sessions", mapping)) || 0;
    const prev = parseFloat(getField(row, "previous_sessions", mapping)) || 0;
    const usageDrop = prev > 0 ? Math.max(0, Math.min((prev - cur) / prev, 1)) : 0;

    const supportComplaints = Math.max(0, parseInt(getField(row, "support_complaints", mapping), 10) || 0);
    const paymentDelay = parsePaymentDelay(getField(row, "payment_delay", mapping));

    const cycleRaw = getField(row, "billing_cycle", mapping).toLowerCase().trim();
    const billingCycle: BillingCycle = /^(monthly|month|mo|mth|mthly|1month|30days?)$/.test(cycleRaw)
      ? "monthly"
      : "yearly";

    const { score, level } = computeChurnScore(daysInactive, usageDrop, supportComplaints, paymentDelay, weights, billingCycle);

    const { error: updateErr } = await supabase
      .from("customers")
      .update({
        last_login_at: lastLoginAt,
        days_inactive: daysInactive,
        usage_drop: usageDrop,
        support_complaints: supportComplaints,
        payment_delay: paymentDelay,
        risk_score: score,
        risk_level: level,
        ai_explanation: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", customer.id)
      .eq("user_id", user.id);

    if (!updateErr) {
      updated += 1;
    }
  }

  return NextResponse.json({ updated });
}
