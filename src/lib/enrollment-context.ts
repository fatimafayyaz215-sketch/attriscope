import { normalizeIndustry } from "@/lib/industry-defaults";

/** UI label for the stored `company` field (SaaS org vs education course). */
export function getEnrollmentFieldLabel(industry?: string | null): string {
  return normalizeIndustry(industry) === "education" ? "Course" : "Company";
}

export function formatEnrollmentForPrompt(
  industry: string | null | undefined,
  company?: string | null,
): string | null {
  const enrollment = company?.trim() ?? "";
  if (!enrollment) return null;

  if (normalizeIndustry(industry) === "education") {
    return `Course / subject enrolled: ${enrollment}`;
  }

  return `Company / account: ${enrollment}`;
}

export function shouldPreserveEnrollmentInEmail(industry?: string | null): boolean {
  return normalizeIndustry(industry) === "education";
}
