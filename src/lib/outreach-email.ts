import type { SupabaseClient } from "@supabase/supabase-js";

export type OutreachDraftPayload = {
  to_email: string;
  subject: string;
  body: string;
};

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Plain-text drafts (from AI) vs HTML edited in TipTap. */
export function bodyLooksLikeHtml(body: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(body);
}

export async function assertCustomerOwnedByUser(
  supabase: SupabaseClient,
  userId: string,
  customerId: string,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const { data, error } = await supabase
    .from("customers")
    .select("id")
    .eq("id", customerId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { ok: false, status: 500, error: error.message };
  if (!data) return { ok: false, status: 404, error: "Customer not found" };
  return { ok: true };
}

/** One draft row per customer (status = draft). */
export async function upsertOutreachDraft(
  supabase: SupabaseClient,
  userId: string,
  customerId: string,
  payload: OutreachDraftPayload,
): Promise<{ ok: true; id: string } | { ok: false; status: number; error: string }> {
  const owned = await assertCustomerOwnedByUser(supabase, userId, customerId);
  if (!owned.ok) return owned;

  const { data: existing, error: findErr } = await supabase
    .from("outreach_emails")
    .select("id")
    .eq("user_id", userId)
    .eq("customer_id", customerId)
    .eq("status", "draft")
    .maybeSingle();

  if (findErr) return { ok: false, status: 500, error: findErr.message };

  if (existing?.id) {
    const { error: updateErr } = await supabase
      .from("outreach_emails")
      .update(payload)
      .eq("id", existing.id);

    if (updateErr) return { ok: false, status: 500, error: updateErr.message };
    return { ok: true, id: existing.id };
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("outreach_emails")
    .insert({
      user_id: userId,
      customer_id: customerId,
      ...payload,
      status: "draft",
    })
    .select("id")
    .single();

  if (insertErr || !inserted) {
    return { ok: false, status: 500, error: insertErr?.message ?? "Failed to save draft" };
  }

  return { ok: true, id: inserted.id };
}
