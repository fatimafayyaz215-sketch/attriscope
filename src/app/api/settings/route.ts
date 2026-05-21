import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
  return NextResponse.json(
    data ?? {
      industry: "saas",
      weight_inactivity: 25,
      weight_usage: 25,
      weight_support: 25,
      weight_payment: 25,
    }
  );
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { industry, weight_inactivity, weight_usage, weight_support, weight_payment } = body;

  const payload = {
    user_id: user.id,
    industry: industry ?? "saas",
    weight_inactivity: weight_inactivity ?? 25,
    weight_usage: weight_usage ?? 25,
    weight_support: weight_support ?? 25,
    weight_payment: weight_payment ?? 25,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("user_settings")
    .upsert(payload, { onConflict: "user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
