export function computeDaysInactiveFromLastLogin(
  lastLoginAt: string | Date | null | undefined,
  fallback = 0,
): number {
  if (!lastLoginAt) return Math.max(0, fallback);

  const parsed = lastLoginAt instanceof Date ? lastLoginAt : new Date(lastLoginAt);
  if (Number.isNaN(parsed.getTime())) return Math.max(0, fallback);

  return Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 86_400_000));
}
