import type { Industry } from "@/lib/industry";
import type { ScoringWeights } from "@/lib/scoring";
import { getIndustryDefaultWeights } from "@/lib/industry-defaults";

type SignalKey = keyof ScoringWeights;

export const SIGNAL_LABELS: Record<SignalKey, string> = {
  inactivity: "Login / Inactivity",
  usage: "Usage Drop",
  support: "Support Complaints",
  payment: "Payment Delay",
};

/** Action prompts tied to each scoring signal and industry dataset fields. */
const SIGNAL_PROMPTS: Record<Industry, Record<SignalKey, string>> = {
  saas: {
    inactivity: "Re-engage accounts with high days_inactive or stale last_login_at?",
    usage: "What to do when current_sessions dropped vs previous_sessions?",
    support: "Playbook for customers with rising support_complaints?",
    payment: "Save accounts where payment_delay is flagged?",
  },
  entertainment: {
    inactivity: "Win back viewers with low daily watch time (high inactivity)?",
    usage: "Retention when engagement rate exceeds watch time (usage drop)?",
    support: "Handle subscribers with high Support Queries Logged?",
    payment: "Recover members with delayed Payment History?",
  },
  education: {
    inactivity: "Re-engage students with low VLE login / days inactive?",
    usage: "Help learners whose session clicks dropped week over week?",
    support: "Intervene when assessment struggle signals are high?",
    payment: "Support learners flagged with payment-risk proxies?",
  },
};

const BILLING_CYCLE_PROMPTS: Record<Industry, string> = {
  saas: "How does billing_cycle (monthly vs yearly) change inactivity caps?",
  entertainment: "Basic monthly vs Standard/Premium yearly — how do caps differ?",
  education: "How does billing_cycle affect my 30-day vs 90-day score caps?",
};

const CSV_UPLOAD_PROMPTS: Record<Industry, string> = {
  saas: "Which CSV columns are required for SaaS upload mapping?",
  entertainment: "Map entertainment CSV: watch time, engagement, support, payment?",
  education: "Which fields should my education CSV include for scoring?",
};

export const ADVISOR_WELCOME_EXAMPLE: Record<Industry, string> = {
  saas: "e.g. last_login_at, usage drop, support tickets, or billing_cycle",
  entertainment: "e.g. watch time, engagement gap, support queries, billing_cycle",
  education: "e.g. VLE activity, usage drop, assessments, billing_cycle",
};

function sortSignalsByWeight(weights: ScoringWeights): SignalKey[] {
  const keys: SignalKey[] = ["inactivity", "usage", "support", "payment"];
  return keys.sort((a, b) => weights[b] - weights[a]);
}

export function getAdvisorWelcomeTopics(industry: Industry, weights: ScoringWeights): string {
  const ordered = sortSignalsByWeight(weights);
  const fieldHints: Record<Industry, Record<SignalKey, string>> = {
    saas: {
      inactivity: "last login / inactivity",
      usage: "session usage drop",
      support: "support_complaints",
      payment: "payment_delay & billing_cycle",
    },
    entertainment: {
      inactivity: "watch time / inactivity",
      usage: "engagement vs watch gap",
      support: "support queries",
      payment: "payment history & billing_cycle",
    },
    education: {
      inactivity: "VLE login inactivity",
      usage: "click / session usage drop",
      support: "assessment struggle",
      payment: "payment proxies & billing_cycle",
    },
  };

  const hints = ordered.map((key) => fieldHints[industry][key]);
  return hints.join(", ");
}

export function getAdvisorQuickPrompts(
  industry: Industry,
  weights: ScoringWeights,
  metrics?: { totalCustomers: number; highRiskCustomers: number },
): string[] {
  const ordered = sortSignalsByWeight(weights);
  const prompts: string[] = [];

  // Top 2 signals by current weight settings
  for (const signal of ordered.slice(0, 2)) {
    prompts.push(SIGNAL_PROMPTS[industry][signal]);
  }

  // Third-highest weighted signal
  if (ordered[2]) {
    prompts.push(SIGNAL_PROMPTS[industry][ordered[2]]);
  }

  prompts.push(BILLING_CYCLE_PROMPTS[industry]);

  const top = ordered[0];
  prompts.push(
    `Why is ${SIGNAL_LABELS[top]} weighted at ${weights[top]}% in my formula?`,
  );

  if (metrics && metrics.totalCustomers > 0 && metrics.highRiskCustomers > 0) {
    prompts.push(
      `Where do I start with ${metrics.highRiskCustomers} high-risk accounts of ${metrics.totalCustomers}?`,
    );
  } else {
    prompts.push(CSV_UPLOAD_PROMPTS[industry]);
  }

  return prompts.slice(0, 6);
}

export function resolveAdvisorWeights(
  industry: Industry,
  settings?: Partial<{
    weight_inactivity: number;
    weight_usage: number;
    weight_support: number;
    weight_payment: number;
  }> | null,
): ScoringWeights {
  const defaults = getIndustryDefaultWeights(industry);
  if (!settings) return defaults;

  return {
    inactivity: settings.weight_inactivity ?? defaults.inactivity,
    usage: settings.weight_usage ?? defaults.usage,
    support: settings.weight_support ?? defaults.support,
    payment: settings.weight_payment ?? defaults.payment,
  };
}
