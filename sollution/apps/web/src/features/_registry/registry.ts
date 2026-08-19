import type { FeatureDefinition, FeatureId } from './types'

export const FEATURE_REGISTRY: Record<FeatureId, FeatureDefinition> = {
  passwordAuth: {
    id: 'passwordAuth',
    mode: 'enabled',
    unavailableReasonKey: 'features.previewUnavailable',
    requiredEnvKeys: ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_PROJECT_ID'],
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
    requiredEnvKeys: [
      'VITE_FEATURE_GOOGLE_AUTH',
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_PROJECT_ID',
    ],
  },
  appleAuth: {
    id: 'appleAuth',
    mode: 'enabled',
    unavailableReasonKey: 'features.previewUnavailable',
    requiredEnvKeys: ['VITE_FEATURE_APPLE_AUTH'],
  },
  stripePayment: {
    id: 'stripePayment',
    mode: 'enabled',
    unavailableReasonKey: 'features.previewUnavailable',
    requiredEnvKeys: ['VITE_STRIPE_PUBLISHABLE_KEY'],
    alternativeAvailable: true,
  },
}

export const FEATURE_IDS = Object.keys(FEATURE_REGISTRY) as FeatureId[]
