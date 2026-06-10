/**
 * Attempts to auto-detect which churn-scoring field a CSV column maps to
 * based on common naming conventions.
 */

export type MappedField =
  | "customer_id"
  | "name"
  | "email"
  | "company"
  | "last_login_at"
  | "days_inactive"
  | "current_sessions"
  | "previous_sessions"
  | "support_complaints"
  | "payment_delay"
  | "billing_cycle"
  | "ignore";

export const FIELD_LABELS: Record<MappedField, string> = {
  customer_id: "Customer ID",
  name: "Customer Name",
  email: "Email Address",
  company: "Company / Org",
  last_login_at: "Last Login Date",
  days_inactive: "Days Inactive",
  current_sessions: "Current Sessions",
  previous_sessions: "Previous Sessions",
  support_complaints: "Support Tickets",
  payment_delay: "Payment Delay (0/1)",
  billing_cycle: "Billing Cycle (monthly/yearly)",
  ignore: "Ignore Column",
};

const PATTERNS: Record<MappedField, RegExp> = {
  customer_id: /^(customer_?id|cust_?id|account_?id|client_?id|user_?id|^id$)$/i,
  name: /^(customer_?name|full_?name|client_?name|first_?name|account_?name|^name$)$/i,
  email: /^(email|email_?address|contact_?email|user_?email)$/i,
  company: /^(company|company_?name|org|organization|account|business)$/i,
  last_login_at: /^(last_?login(_?at)?|last_?login_?date|last_?activity|last_?active|last_?seen|last_?visit|last_?access|lastlogin)$/i,
  days_inactive: /^(days_?inactive|inactive_?days|days_?since_?login|days_?without_?login)$/i,
  current_sessions: /^(sessions|current_?sessions|session_?count|monthly_?sessions|monthly_?usage|current_?usage|feature_?usage|logins|monthly_?logins|usage)$/i,
  previous_sessions: /^(previous_?sessions|last_?month_?sessions|prior_?sessions|prev_?sessions|previous_?usage|prior_?usage|last_?month_?usage|prev_?month_?sessions|prior_month_usage)$/i,
  support_complaints: /^(support_?tickets|tickets|complaints|open_?tickets|support_?complaints|support_?queries_?logged|ticket_?count|support_?count|num_?tickets)$/i,
  payment_delay: /^(payment_?delay|payment_?status|payment_?history.*|late_?payment|missed_?payment|overdue|payment_?overdue|is_?late)$/i,
  billing_cycle: /^(billing_?cycle|subscription_?plan|plan_?type|subscription_?type|plan|billing_?period|subscription_?cycle|cycle|tier)$/i,
  ignore: /^$/,
};

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function detectColumn(header: string): MappedField {
  const normalized = normalizeHeader(header);
  for (const [field, pattern] of Object.entries(PATTERNS)) {
    if (field === "ignore") continue;
    if (pattern.test(normalized)) return field as MappedField;
  }
  return "ignore";
}

export function autoDetectMapping(headers: string[]): Record<string, MappedField> {
  const mapping: Record<string, MappedField> = {};
  const usedFields = new Set<MappedField>();

  for (const header of headers) {
    const detected = detectColumn(header);
    if (detected !== "ignore" && usedFields.has(detected)) {
      mapping[header] = "ignore";
      continue;
    }
    mapping[header] = detected;
    if (detected !== "ignore") {
      usedFields.add(detected);
    }
  }

  return mapping;
}
