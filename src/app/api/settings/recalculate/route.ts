import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectColumn, type MappedField } from "@/lib/column-detector";
import { parseBillingCycle } from "@/lib/billing-cycle";
import { computeChurnScore, computeUsageDrop, DEFAULT_WEIGHTS, type ScoringWeights } from "@/lib/scoring";
import { computeDaysInactiveFromLastLogin } from "@/lib/inactivity";
import { normalizeIndustry } from "@/lib/industry-defaults";

const BATCH_SIZE = 500;

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

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Prefer weights sent by the client (reflects current UI selection incl. unsaved industry changes).
  // Fall back to DB-persisted settings only if no weights are provided.
  let weights: ScoringWeights = DEFAULT_WEIGHTS;
  let bodyWeightsProvided = false;
  try {
    const body = await request.json();
    if (body && typeof body === "object") {
      const { weight_inactivity, weight_usage, weight_support, weight_payment } = body as Record<string, unknown>;
      if (
        typeof weight_inactivity === "number" &&
        typeof weight_usage === "number" &&
        typeof weight_support === "number" &&
        typeof weight_payment === "number"
      ) {
        weights = {
          inactivity: weight_inactivity,
          usage: weight_usage,
          support: weight_support,
          payment: weight_payment,
        };
        bodyWeightsProvided = true;
      }
    }
  } catch {
    // no body / invalid JSON — fall through to DB lookup
  }

  let industry = normalizeIndustry(null);

  if (!bodyWeightsProvided) {
    const { data: settingsRow } = await supabase
      .from("user_settings")
      .select("industry, weight_inactivity, weight_usage, weight_support, weight_payment")
      .eq("user_id", user.id)
      .single();

    if (settingsRow) {
      industry = normalizeIndustry(settingsRow.industry);
      weights = {
        inactivity: settingsRow.weight_inactivity,
        usage: settingsRow.weight_usage,
        support: settingsRow.weight_support,
        payment: settingsRow.weight_payment,
      };
    }
  } else {
    const { data: settingsRow } = await supabase
      .from("user_settings")
      .select("industry")
      .eq("user_id", user.id)
      .single();
    if (settingsRow?.industry) {
      industry = normalizeIndustry(settingsRow.industry);
    }
  }

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

  // Compute all scores in memory first (fast, no DB round-trips)
  const now = new Date().toISOString();
  const updateRows: Record<string, unknown>[] = [];

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
    const usageDrop = computeUsageDrop(cur, prev, daysInactive);

    const supportComplaints = Math.max(0, parseInt(getField(row, "support_complaints", mapping), 10) || 0);
    const paymentDelay = parsePaymentDelay(getField(row, "payment_delay", mapping));

    const billingCycle = parseBillingCycle(getField(row, "billing_cycle", mapping));

    const { score, level } = computeChurnScore(
      daysInactive,
      usageDrop,
      supportComplaints,
      paymentDelay,
      weights,
      billingCycle,
      industry,
    );

    updateRows.push({
      id: customer.id,
      user_id: user.id,
      last_login_at: lastLoginAt,
      days_inactive: daysInactive,
      usage_drop: usageDrop,
      support_complaints: supportComplaints,
      payment_delay: paymentDelay,
      risk_score: score,
      risk_level: level,
      ai_explanation: null,
      updated_at: now,
    });
  }

  // Bulk upsert in batches — ~500x fewer network round-trips vs one UPDATE per row
  let updated = 0;
  for (let i = 0; i < updateRows.length; i += BATCH_SIZE) {
    const chunk = updateRows.slice(i, i + BATCH_SIZE);
    const { error: upsertErr } = await supabase
      .from("customers")
      .upsert(chunk, { onConflict: "id" });
    if (!upsertErr) updated += chunk.length;
  }

  return NextResponse.json({ updated });
}
