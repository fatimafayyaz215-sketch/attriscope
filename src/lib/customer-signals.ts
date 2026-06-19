export type ChurnSignalKey = "inactivity" | "usage" | "support" | "payment";
export type SignalFilter = ChurnSignalKey | "all";

export const SIGNAL_FILTER_OPTIONS: { value: SignalFilter; label: string }[] = [
  { value: "all", label: "All Signals" },
  { value: "inactivity", label: "Inactivity" },
  { value: "usage", label: "Usage Drop" },
  { value: "support", label: "Support Complaints" },
  { value: "payment", label: "Payment Delay" },
];

export function parseSignalFilter(value: string | null): SignalFilter {
  if (value === "inactivity" || value === "usage" || value === "support" || value === "payment") {
    return value;
  }
  return "all";
}

type SignalCustomer = {
  days_inactive: number;
  usage_drop: number;
  support_complaints: number;
  payment_delay: number | boolean;
};

export interface CustomerSignalFactor {
  key: ChurnSignalKey;
  label: string;
  strength: number;
}

export function getCustomerSignalFactors(customer: SignalCustomer): CustomerSignalFactor[] {
  return [
    {
      key: "inactivity",
      label: `${customer.days_inactive}d inactive`,
      strength: Math.min(customer.days_inactive / 90, 1),
    },
    {
      key: "usage",
      label: `${Math.round(customer.usage_drop * 100)}% usage drop`,
      strength: Math.min(Math.max(customer.usage_drop, 0), 1),
    },
    {
      key: "support",
      label: `${customer.support_complaints} tickets`,
      strength: Math.min(customer.support_complaints / 20, 1),
    },
    {
      key: "payment",
      label: "Payment delayed",
      strength: Number(customer.payment_delay) > 0 ? 1 : 0,
    },
  ];
}

export function getCustomerKeyFactor(customer: SignalCustomer): CustomerSignalFactor {
  return [...getCustomerSignalFactors(customer)].sort((a, b) => b.strength - a.strength)[0];
}

/** When a signal filter is active, show that signal's value — not the overall top factor. */
export function getCustomerDisplayFactor(
  customer: SignalCustomer,
  signal: SignalFilter,
): CustomerSignalFactor {
  if (signal === "all") return getCustomerKeyFactor(customer);
  const matched = getCustomerSignalFactors(customer).find((f) => f.key === signal);
  return matched ?? getCustomerKeyFactor(customer);
}

export function getSignalFilterLabel(signal: SignalFilter): string {
  return SIGNAL_FILTER_OPTIONS.find((o) => o.value === signal)?.label ?? "All Signals";
}

/** True when the customer has a meaningful value for the given churn signal. */
export function customerMatchesSignalFilter(customer: SignalCustomer, signal: SignalFilter): boolean {
  if (signal === "all") return true;

  const usageDrop = Number(customer.usage_drop) || 0;
  const supportComplaints = Number(customer.support_complaints) || 0;
  const daysInactive = Number(customer.days_inactive) || 0;

  switch (signal) {
    case "payment":
      return Number(customer.payment_delay) > 0;
    case "usage":
      return usageDrop > 0;
    case "support":
      return supportComplaints > 0;
    case "inactivity":
      return daysInactive >= 7;
  }
}
