/**
 * Concatenates class names, filtering falsy values.
 * Drop-in for the common `clsx`/`cn` pattern — no extra dependency needed.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Formats a number as a rounded percentage string. e.g. 73.4 → "73%" */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/** Formats an ISO date string to a human-readable date. */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Returns whole days elapsed since a given ISO date string. */
export function daysSince(dateString: string): number {
  const ms = Date.now() - new Date(dateString).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
