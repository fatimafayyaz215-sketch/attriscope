import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_INDUSTRY, getIndustryDefaultWeights, sumWeights } from "@/lib/industry-defaults";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return defaults if no settings row yet
  const defaultWeights = getIndustryDefaultWeights(DEFAULT_INDUSTRY);
  return NextResponse.json(
    data ?? {
      industry: DEFAULT_INDUSTRY,
      weight_inactivity: defaultWeights.inactivity,
      weight_usage: defaultWeights.usage,
      weight_support: defaultWeights.support,
      weight_payment: defaultWeights.payment,
    }
  );
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { industry, weight_inactivity, weight_usage, weight_support, weight_payment } = body;

  // Fetch existing row so we never accidentally overwrite fields not included in this request
  const { data: existing } = await supabase
    .from("user_settings")
    .select("industry, weight_inactivity, weight_usage, weight_support, weight_payment")
    .eq("user_id", user.id)
    .single();

  const nextIndustry = industry ?? existing?.industry ?? DEFAULT_INDUSTRY;
  const industryDefaults = getIndustryDefaultWeights(nextIndustry);
  const isWeightsPayloadProvided = [weight_inactivity, weight_usage, weight_support, weight_payment].some((value) => value != null);

  const resolvedWeights = isWeightsPayloadProvided
    ? {
        inactivity: weight_inactivity ?? existing?.weight_inactivity ?? industryDefaults.inactivity,
        usage: weight_usage ?? existing?.weight_usage ?? industryDefaults.usage,
        support: weight_support ?? existing?.weight_support ?? industryDefaults.support,
        payment: weight_payment ?? existing?.weight_payment ?? industryDefaults.payment,
      }
    : industry !== undefined
    ? industryDefaults
    : {
        inactivity: existing?.weight_inactivity ?? industryDefaults.inactivity,
        usage: existing?.weight_usage ?? industryDefaults.usage,
        support: existing?.weight_support ?? industryDefaults.support,
        payment: existing?.weight_payment ?? industryDefaults.payment,
      };

  if (sumWeights(resolvedWeights) > 100) {
    return NextResponse.json({ error: "Total weights cannot exceed 100%" }, { status: 400 });
  }

  const payload = {
    user_id: user.id,
    industry: nextIndustry,
    weight_inactivity: resolvedWeights.inactivity,
    weight_usage: resolvedWeights.usage,
    weight_support: resolvedWeights.support,
    weight_payment: resolvedWeights.payment,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("user_settings")
    .upsert(payload, { onConflict: "user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
