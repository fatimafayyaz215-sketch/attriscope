// ── Risk ──────────────────────────────────────────────────────────────────────

export type RiskLevel = "high" | "medium" | "low";

export interface ChurnScore {
  /** x₁ — 30%: Days since last login (raw number of days) */
  daysInactive: number;
  /** x₂ — 25%: Number of unresolved support tickets */
  supportComplaints: number;
  /** x₃ — 25%: Usage drop ratio 0–1 = (lastMonth - current) / lastMonth */
  usageDrop: number;
  /** x₄ — 20%: Payment delay binary — 0 = clear, 1 = delayed / missed */
  paymentDelay: 0 | 1;
  /** Final weighted score 0–100 */
  total: number;
  /** Banded risk level */
  level: RiskLevel;
}

// ── Customer ──────────────────────────────────────────────────────────────────

export type Industry = "streaming" | "saas" | "elearning";

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  industry: Industry;
  /** ISO date string */
  joinedAt: string;
  /** ISO date string */
  lastLoginAt: string;
  score: ChurnScore;
  /**
   * true when the customer has fewer than 2 weeks of data.
   * UI must show an "Insufficient Data" badge instead of a score.
   */
  hasInsufficientData: boolean;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}
