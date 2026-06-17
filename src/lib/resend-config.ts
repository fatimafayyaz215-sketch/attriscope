export const DEFAULT_RESEND_FROM = "Attriscope <onboarding@resend.dev>";

export function getResendFromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL?.trim();
  // Unquoted .env values are truncated at spaces — require a valid email in the value.
  if (!raw || !raw.includes("@")) {
    return DEFAULT_RESEND_FROM;
  }
  return raw;
}

/** True when using Resend's shared test sender (no verified domain). */
export function isResendTestMode(from = getResendFromAddress()): boolean {
  return /@resend\.dev\s*>?$/i.test(from) || from.includes("onboarding@resend.dev");
}

export function getResendTestRecipient(): string | null {
  const value = process.env.RESEND_TEST_RECIPIENT?.trim();
  return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : null;
}

/** Resolve actual Resend delivery address (redirects in test mode). */
export function resolveResendDeliveryAddress(intendedRecipient: string): {
  deliverTo: string;
  testMode: boolean;
  testRecipient: string | null;
} {
  const testRecipient = getResendTestRecipient();
  const testMode = isResendTestMode();

  if (testMode && !testRecipient) {
    return { deliverTo: intendedRecipient, testMode: true, testRecipient: null };
  }

  if (
    testMode &&
    testRecipient &&
    intendedRecipient.toLowerCase() !== testRecipient.toLowerCase()
  ) {
    return { deliverTo: testRecipient, testMode: true, testRecipient };
  }

  return { deliverTo: intendedRecipient, testMode, testRecipient };
}
