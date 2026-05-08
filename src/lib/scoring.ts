// ── Scoring formula weights ───────────────────────────────────────────────────

export interface ScoringWeights {
  inactivity: number; // 0–100
  usage: number;
  support: number;
  payment: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  inactivity: 30,
  usage: 25,
  support: 25,
  payment: 20,
};

/**
 * Compute churn risk score 0–100 using the transparent weighted formula:
 *
 *   Score = Σ(normalised_factor × weight) / Σ(weights) × 100
 *
 * Factors:
 *   x₁ – Login/Inactivity  (weight 30 %): days since last login, capped at 90
 *   x₂ – Usage Drop        (weight 25 %): ratio 0–1, (prev − cur) / prev
 *   x₃ – Support Complaints(weight 25 %): ticket count, capped at 10
 *   x₄ – Payment Delays    (weight 20 %): binary 0 / 1
 */
export function computeChurnScore(
  daysInactive: number,
  usageDrop: number,        // 0–1
  supportComplaints: number,
  paymentDelay: 0 | 1,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): { score: number; level: "high" | "medium" | "low" } {
  const w = weights;
  const totalWeight = w.inactivity + w.usage + w.support + w.payment;

  const x1 = Math.min(daysInactive / 90, 1);
  const x2 = Math.min(Math.max(usageDrop, 0), 1);
  const x3 = Math.min(supportComplaints / 10, 1);
  const x4 = paymentDelay as number;

  const raw = x1 * w.inactivity + x2 * w.usage + x3 * w.support + x4 * w.payment;
  const score = Math.round((raw / totalWeight) * 100);

  const level: "high" | "medium" | "low" =
    score >= 70 ? "high" : score >= 40 ? "medium" : "low";

  return { score, level };
}
