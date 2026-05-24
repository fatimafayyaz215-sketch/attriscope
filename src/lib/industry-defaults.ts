import type { ScoringWeights } from "@/lib/scoring";

export type IndustryId = "entertainment" | "saas" | "education";

export const DEFAULT_INDUSTRY: IndustryId = "saas";

export const INDUSTRY_DEFAULT_WEIGHTS: Record<IndustryId, ScoringWeights> = {
  entertainment: { inactivity: 30, usage: 30, support: 20, payment: 20 },
  saas: { inactivity: 20, usage: 30, support: 30, payment: 20 },
  education: { inactivity: 35, usage: 25, support: 15, payment: 25 },
};

export function getIndustryDefaultWeights(industry?: string | null): ScoringWeights {
  if (industry === "entertainment" || industry === "saas" || industry === "education") {
    return INDUSTRY_DEFAULT_WEIGHTS[industry];
  }

  return INDUSTRY_DEFAULT_WEIGHTS[DEFAULT_INDUSTRY];
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
