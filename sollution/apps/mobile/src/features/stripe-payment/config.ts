/**
 * Shared Stripe publishable-key helpers (no platform SDK imports).
 */

export function getStripePublishableKey(): string {
  return process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? '';
}

export function hasStripePublishableKey(): boolean {
  const key = getStripePublishableKey();
  if (!key) return false;
  const lower = key.toLowerCase();
  return lower !== '0' && lower !== 'false' && lower !== 'no';
}
