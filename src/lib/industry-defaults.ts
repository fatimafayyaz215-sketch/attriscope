import type { ScoringWeights } from "@/lib/scoring";

export type IndustryId = "entertainment" | "saas" | "education";

export const DEFAULT_INDUSTRY: IndustryId = "saas";

export const INDUSTRY_DEFAULT_WEIGHTS: Record<IndustryId, ScoringWeights> = {
  entertainment: { inactivity: 35, usage: 30, support: 20, payment: 15 },
  // SaaS preset: usage drop (45) and payment delay (30) are strongest churn signals
  saas: { inactivity: 10, usage: 45, support: 15, payment: 30 },
  education: { inactivity: 35, usage: 25, support: 15, payment: 25 },
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
