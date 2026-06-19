import type { ScoringWeights } from "@/lib/scoring";

export type IndustryId = "entertainment" | "saas" | "education";

export const DEFAULT_INDUSTRY: IndustryId = "saas";

export const INDUSTRY_DEFAULT_WEIGHTS: Record<IndustryId, ScoringWeights> = {
  entertainment: { inactivity: 30, usage: 30, support: 20, payment: 20 },
  saas: { inactivity: 20, usage: 30, support: 30, payment: 20 },
  education: { inactivity: 35, usage: 25, support: 15, payment: 25 },
};

/** Risk band cutoffs per industry (score 0–100). */
export const RISK_THRESHOLDS: Record<IndustryId, { high: number; medium: number }> = {
  entertainment: { high: 70, medium: 40 },
  saas: { high: 70, medium: 40 },
  // Education: calibrated against OULAD withdrawal labels (see datasets/education/validate_formula.py)
  education: { high: 50, medium: 35 },
};

/** Maps stored values (including legacy "others") to a supported industry id. */
export function normalizeIndustry(industry?: string | null): IndustryId {
  if (industry === "entertainment" || industry === "saas" || industry === "education") {
    return industry;
  }
  return DEFAULT_INDUSTRY;
}

export function getIndustryDefaultWeights(industry?: string | null): ScoringWeights {
  return INDUSTRY_DEFAULT_WEIGHTS[normalizeIndustry(industry)];
}

export function sumWeights(weights: Pick<ScoringWeights, "inactivity" | "usage" | "support" | "payment">): number {
  return weights.inactivity + weights.usage + weights.support + weights.payment;
}

export function capWeightUpdate(
  weights: ScoringWeights,
  key: keyof ScoringWeights,
  nextValue: number,
): ScoringWeights {
  const otherTotal = sumWeights(weights) - weights[key];
  const cappedValue = Math.max(0, Math.min(nextValue, 100 - otherTotal));

  return {
    ...weights,
    [key]: cappedValue,
  };
}

export function getWeightSliderMax(
  weights: ScoringWeights,
  key: keyof ScoringWeights,
): number {
  return Math.max(0, 100 - (sumWeights(weights) - weights[key]));
}
