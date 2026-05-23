// ── Scoring formula weights ───────────────────────────────────────────────────

export interface ScoringWeights {
  inactivity: number; // 0–100
  usage: number;
  support: number;
  payment: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  inactivity: 25,
  usage: 25,
  support: 25,
  payment: 25,
};

export type BillingCycle = "monthly" | "yearly";

/**
 * Normalization caps that differ by billing cycle.
 *   monthly: inactivity capped at 30 days, support at 5 tickets
 *   yearly:  inactivity capped at 90 days, support at 10 tickets
 */
export const BILLING_CAPS: Record<BillingCycle, { inactivityDays: number; supportTickets: number }> = {
  monthly: { inactivityDays: 30, supportTickets: 5 },
  yearly:  { inactivityDays: 90, supportTickets: 10 },
};

/**
 * Compute churn risk score 0–100 using the transparent weighted formula:
 *
 *   Score = Σ(normalised_factor × weight) / Σ(weights) × 100
 *
 * Normalization (Step 1) — caps are dynamic per billing cycle:
 *   x₁ – Login/Inactivity  : days / inactivityCap  (monthly→30, yearly→90)
 *   x₂ – Usage Drop        : ratio clamped 0–1
 *   x₃ – Support Complaints: tickets / supportCap  (monthly→5,  yearly→10)
 *   x₄ – Payment Delays    : binary 0 / 1 (same for both)
 */
export function computeChurnScore(
  daysInactive: number,
  usageDrop: number,        // 0–1
  supportComplaints: number,
  paymentDelay: 0 | 1,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
  billingCycle: BillingCycle = "yearly",
): { score: number; level: "high" | "medium" | "low" } {
  const w = weights;
  const totalWeight = w.inactivity + w.usage + w.support + w.payment;
  const { inactivityDays, supportTickets } = BILLING_CAPS[billingCycle];

  const x1 = Math.min(daysInactive / inactivityDays, 1);
  const x2 = Math.min(Math.max(usageDrop, 0), 1);
  const x3 = Math.min(supportComplaints / supportTickets, 1);
  const x4 = paymentDelay as number;

  const raw = x1 * w.inactivity + x2 * w.usage + x3 * w.support + x4 * w.payment;
  const score = Math.round((raw / totalWeight) * 100);

  const level: "high" | "medium" | "low" =
    score >= 70 ? "high" : score >= 40 ? "medium" : "low";

  return { score, level };
}
