import type { FeatureDefinition, FeatureId } from './types';

/**
 * Canonical injectable feature catalog (admin).
 * Gate UI with `getFeatureStatus` / `isFeatureInteractive` — see ai_instruction/features.
 *
 * Manual image URL on products is always on (not a feature).
 *
 * `firebaseStorage` ships **disabled** — flip `mode` to `enabled` and set
 * `VITE_FEATURE_FIREBASE_STORAGE=1` per white-label deploy that uses Storage.
 */
export const FEATURE_REGISTRY: Record<FeatureId, FeatureDefinition> = {
  firebaseStorage: {
    id: 'firebaseStorage',
    mode: 'enabled',
    unavailableReasonKey: 'features.firebaseStorageUnavailable',
    requiredEnvKeys: ['VITE_FEATURE_FIREBASE_STORAGE'],
    /** Manual URL remains; hide upload control when not provisioned. */
    alternativeAvailable: true,
  },
};

export const FEATURE_IDS = Object.keys(FEATURE_REGISTRY) as FeatureId[];
