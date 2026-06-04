import type { Industry } from "@/lib/industry";

/** One-click starter questions in the Churn Advisor UI (per Settings industry). */
export const ADVISOR_QUICK_PROMPTS: Record<Industry, string[]> = {
  saas: [
    "What should I do about usage drops?",
    "How do I save accounts before renewal?",
    "Playbook for high MRR customers at risk?",
    "Reduce churn from support tickets?",
    "Improve trial-to-paid conversion?",
    "Best feature-adoption plays for sticky SaaS?",
    "When should I offer a discount vs success plan?",
    "How do I prioritize my high-risk queue today?",
  ],
  entertainment: [
    "Win back subscribers with low watch time?",
    "Retention ideas when engagement drops?",
    "Pause plan vs cancel — when to offer each?",
    "Reduce churn after payment failures?",
    "Personalized content recommendation plays?",
    "Keep annual subscribers through renewal?",
    "Handle binge-then-churn subscribers?",
    "How do I prioritize at-risk members today?",
  ],
  education: [
    "Re-engage students who stopped after module 1?",
    "Retention tactics before term renewal?",
    "Help learners with low assessment scores?",
    "Reduce dropout in the first 30 days?",
    "Cohort and community ideas to boost stickiness?",
    "When to nudge vs personal outreach?",
    "Office hours and mentor plays that work?",
    "How do I prioritize at-risk learners today?",
  ],
};

export const ADVISOR_WELCOME_EXAMPLE: Record<Industry, string> = {
  saas: "e.g. trial conversion, seat activation, or renewal saves",
  entertainment: "e.g. watch time, win-back offers, or pause vs cancel",
  education: "e.g. course completion, learner nudges, or cohort engagement",
};

export const ADVISOR_WELCOME_TOPICS: Record<Industry, string> = {
  saas:
    "product adoption, renewals, MRR at risk, support tickets, trials, and seat activation",
  entertainment:
    "watch time, content engagement, plan changes, payment issues, and win-back campaigns",
  education:
    "course progress, inactive learners, assessments, cohort engagement, and renewals",
};
