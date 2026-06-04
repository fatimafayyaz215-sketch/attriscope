export const ADVISOR_INDUSTRY_CHANGED = "churnguard:industry-changed";

export function notifyAdvisorIndustryChanged(industry: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(ADVISOR_INDUSTRY_CHANGED, { detail: { industry } }),
  );
}
