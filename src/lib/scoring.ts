// ── Scoring formula weights ───────────────────────────────────────────────────

import {
  normalizeIndustry,
  RISK_THRESHOLDS,
  type IndustryId,
} from "@/lib/industry-defaults";

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

const DISENGAGED_INACTIVITY_DAYS = 28;

/**
 * Usage drop ratio 0–1. When both session windows are empty but the account has been
 * inactive for a while, treat as full disengagement (common with education/OULAD data).
 */
export function computeUsageDrop(
  currentSessions: number,
  previousSessions: number,
  daysInactive = 0,
): number {
  const cur = Math.max(0, currentSessions);
  const prev = Math.max(0, previousSessions);

  if (prev <= 0 && cur <= 0 && daysInactive > DISENGAGED_INACTIVITY_DAYS) {
    return 1;
  }
  if (prev <= 0) return 0;
  return Math.max(0, Math.min((prev - cur) / prev, 1));
}

export function resolveRiskLevel(
  score: number,
  industry?: string | null,
): "high" | "medium" | "low" {
  const { high, medium } = RISK_THRESHOLDS[normalizeIndustry(industry)];
  if (score >= high) return "high";
  if (score >= medium) return "medium";
  return "low";
}

/** Engagement 0–100 for dashboard trend (blends inactivity + usage, not drop alone). */
export function computeCustomerEngagement(daysInactive: number, usageDrop: number): number {
  const inactivityEng = 1 - Math.min(Math.max(0, daysInactive) / 90, 1);
  const usageEng = 1 - Math.min(Math.max(0, usageDrop), 1);
  return Math.round(((inactivityEng + usageEng) / 2) * 100);
}

export function getRiskThresholds(industry?: string | null): { high: number; medium: number } {
  return RISK_THRESHOLDS[normalizeIndustry(industry)];
}

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
  industry?: string | null,
): { score: number; level: "high" | "medium" | "low" } {
  const w = weights;
  const totalWeight = w.inactivity + w.usage + w.support + w.payment;
  const { inactivityDays, supportTickets } = BILLING_CAPS[billingCycle];
  const industryId = normalizeIndustry(industry);

  const x1 = Math.min(daysInactive / inactivityDays, 1);
  const x2 = Math.min(Math.max(usageDrop, 0), 1);
  const x3 = Math.min(supportComplaints / supportTickets, 1);
  const x4 = paymentDelay as number;

  const raw = x1 * w.inactivity + x2 * w.usage + x3 * w.support + x4 * w.payment;
  let score = Math.round((raw / totalWeight) * 100);

  // Education: unregistration in OULAD maps 1:1 to withdrawal — floor score at high threshold
  if (industryId === "education" && paymentDelay === 1) {
    score = Math.max(score, RISK_THRESHOLDS.education.high);
  }

  const level = resolveRiskLevel(score, industryId);

  return { score, level };
}

export type { IndustryId };
