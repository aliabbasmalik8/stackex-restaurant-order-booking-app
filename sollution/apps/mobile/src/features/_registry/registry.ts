import type { FeatureDefinition, FeatureId } from './types';

/**
 * Canonical injectable feature catalog.
 * Gate UI with `getFeatureStatus` / `isFeatureInteractive` — see ai_instruction/features.
 *
 * Not registered (always on): continue as guest, cash payment.
 *
 * Missing `requiredEnvKeys`:
 * - `alternativeAvailable: true` → hidden (e.g. Stripe; cash remains)
 * - otherwise → disabled (still visible / greyed)
 */
export const FEATURE_REGISTRY: Record<FeatureId, FeatureDefinition> = {
  passwordAuth: {
    id: 'passwordAuth',
    mode: 'enabled',
    unavailableReasonKey: 'features.previewUnavailable',
    requiredEnvKeys: [
      'EXPO_PUBLIC_FIREBASE_API_KEY',
      'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    ],
  },
  phoneAuth: {
    id: 'phoneAuth',
    mode: 'hidden',
    unavailableReasonKey: 'features.previewUnavailable',
  },
  googleAuth: {
    id: 'googleAuth',
    mode: 'enabled',
    unavailableReasonKey: 'features.previewUnavailable',
    // Firebase client keys are enough for web (Firebase Google popup).
    // Native also needs EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID — gated in features/auth helpers.
    requiredEnvKeys: [
      'EXPO_PUBLIC_FEATURE_GOOGLE_AUTH',
      'EXPO_PUBLIC_FIREBASE_API_KEY',
      'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    ],
  },
  appleAuth: {
    id: 'appleAuth',
    mode: 'enabled',
    unavailableReasonKey: 'features.previewUnavailable',
    requiredEnvKeys: ['EXPO_PUBLIC_FEATURE_APPLE_AUTH'],
  },
  stripePayment: {
    id: 'stripePayment',
    mode: 'enabled',
    unavailableReasonKey: 'features.previewUnavailable',
    requiredEnvKeys: ['EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY'],
    alternativeAvailable: true,
  },
};

export const FEATURE_IDS = Object.keys(FEATURE_REGISTRY) as FeatureId[];
