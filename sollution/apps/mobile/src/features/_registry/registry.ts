import type { FeatureDefinition, FeatureId } from './types';

/**
 * Canonical injectable feature catalog.
 * Gate UI with `getFeatureStatus` / `isFeatureInteractive` — see ai_instruction/features.
 *
 * Not registered (always on): continue as guest, cash payment.
 */
export const FEATURE_REGISTRY: Record<FeatureId, FeatureDefinition> = {
  passwordAuth: {
    id: 'passwordAuth',
    mode: 'enabled',
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
    requiredEnvKeys: ['EXPO_PUBLIC_FEATURE_GOOGLE_AUTH'],
    alternativeAvailable: true,
  },
  appleAuth: {
    id: 'appleAuth',
    mode: 'enabled',
    unavailableReasonKey: 'features.previewUnavailable',
    requiredEnvKeys: ['EXPO_PUBLIC_FEATURE_APPLE_AUTH'],
    alternativeAvailable: true,
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
