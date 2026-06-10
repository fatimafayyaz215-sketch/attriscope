export const ADVISOR_INDUSTRY_CHANGED = "attriscope:industry-changed";
export const ADVISOR_SETTINGS_CHANGED = "attriscope:settings-changed";

export function notifyAdvisorIndustryChanged(industry: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(ADVISOR_INDUSTRY_CHANGED, { detail: { industry } }),
  );
}

export function notifyAdvisorSettingsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ADVISOR_SETTINGS_CHANGED));
}
