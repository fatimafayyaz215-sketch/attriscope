import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase/server";
import { computeChurnScore, DEFAULT_WEIGHTS, ScoringWeights, BillingCycle } from "@/lib/scoring";
import type { MappedField } from "@/lib/column-detector";
import { computeDaysInactiveFromLastLogin } from "@/lib/inactivity";

type Mapping = Record<string, MappedField>;

function getField(row: Record<string, string>, field: MappedField, mapping: Mapping): string {
  const col = Object.entries(mapping).find(([, v]) => v === field)?.[0];
  return col ? (row[col] ?? "").toString().trim() : "";
}

function parsePaymentDelay(raw: string): 0 | 1 {
  const v = raw.toLowerCase();
  if (v === "1" || v === "true" || v === "yes" || v === "delayed" || v === "late" || v === "missed" || v === "overdue") return 1;
  return 0;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Accept multipart form: file (CSV) + mapping (JSON string)
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const mappingRaw = formData.get("mapping") as string | null;

  if (!file || !mappingRaw) {
    return NextResponse.json({ error: "Missing file or mapping" }, { status: 400 });
  }

  const mapping: Mapping = JSON.parse(mappingRaw);
  const csvText = await file.text();

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (!parsed.data.length) {
    return NextResponse.json({ error: "CSV is empty" }, { status: 400 });
  }

  // Fetch user's scoring weights
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

  const rows = parsed.data.slice(0, 10_000); // safety cap

  const records = rows.map((row) => {
    const name = getField(row, "name", mapping) || getField(row, "customer_id", mapping) || "Unknown";
    const email = getField(row, "email", mapping).toLowerCase();
    const company = getField(row, "company", mapping);

    const rawDays = getField(row, "days_inactive", mapping);
    const rawLogin = getField(row, "last_login_at", mapping);

    let lastLoginAt: string | null = null;
    if (rawLogin) {
      const d = new Date(rawLogin);
      if (!isNaN(d.getTime())) lastLoginAt = d.toISOString();
    }

    const rawDaysFallback = Math.max(0, parseInt(rawDays, 10) || 0);
    const daysInactive = computeDaysInactiveFromLastLogin(lastLoginAt, rawDaysFallback);

    // Usage drop
    let usageDrop = 0;
    const cur = parseFloat(getField(row, "current_sessions", mapping)) || 0;
    const prev = parseFloat(getField(row, "previous_sessions", mapping)) || 0;
    if (prev > 0) usageDrop = Math.max(0, Math.min((prev - cur) / prev, 1));

    const supportComplaints = Math.max(0, parseInt(getField(row, "support_complaints", mapping)) || 0);
    const paymentDelay = parsePaymentDelay(getField(row, "payment_delay", mapping));

    // Billing cycle — normalise common variants, default to 'yearly'
    const cycleRaw = getField(row, "billing_cycle", mapping).toLowerCase().trim();
    const billingCycle: BillingCycle = /^(monthly|month|mo|mth|mthly|1month|30days?)$/.test(cycleRaw)
      ? "monthly"
      : "yearly";

    const { score, level } = computeChurnScore(daysInactive, usageDrop, supportComplaints, paymentDelay, weights, billingCycle);

    // Last login timestamp
    if (!lastLoginAt && daysInactive > 0) {
      lastLoginAt = new Date(Date.now() - daysInactive * 86_400_000).toISOString();
    }

    return {
      user_id: user.id,
      name,
      email,
      company,
      last_login_at: lastLoginAt,
      days_inactive: daysInactive,
      usage_drop: usageDrop,
      support_complaints: supportComplaints,
      payment_delay: paymentDelay,
      risk_score: score,
      risk_level: level,
      raw_data: row,
    };
  });

  // Delete all existing customers for this user before inserting — re-upload replaces data
  const { error: deleteErr } = await supabase
    .from("customers")
    .delete()
    .eq("user_id", user.id);
  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  const { data, error } = await supabase.from("customers").insert(records).select("id, name, email, risk_score, risk_level");
  if (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count: data.length, customers: data });
}
