import type { BillingCycle } from "@/lib/scoring";

/**
 * Normalise billing cycle / plan labels to monthly or yearly caps.
 * Accepts Attriscope values (monthly/yearly) and entertainment plan tiers (Basic/Standard/Premium).
 */
export function parseBillingCycle(raw: string | null | undefined): BillingCycle {
  const v = (raw ?? "").toLowerCase().trim();
  if (!v) return "yearly";

  if (/^(monthly|month|mo|mth|mthly|1month|30days?|basic)$/.test(v)) {
    return "monthly";
  }

  if (/^(yearly|annual|year|y|standard|premium|pro|enterprise)$/.test(v)) {
    return "yearly";
  }

  return "yearly";
}
