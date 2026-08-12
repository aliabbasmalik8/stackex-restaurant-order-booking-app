import { FEATURE_REGISTRY } from './registry';
import type { FeatureId, FeatureMode, FeatureStatus } from './types';

/**
 * Expo only inlines *static* `process.env.EXPO_PUBLIC_*` at bundle time.
 * Keep this map in the resolver so `requiredEnvKeys` lookups work after export.
 */
const FEATURE_ENV = {
  EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  EXPO_PUBLIC_FEATURE_APPLE_AUTH: process.env.EXPO_PUBLIC_FEATURE_APPLE_AUTH,
  EXPO_PUBLIC_FEATURE_GOOGLE_AUTH: process.env.EXPO_PUBLIC_FEATURE_GOOGLE_AUTH,
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
} as const;

function readFeatureEnv(key: string): string | undefined {
  if (key in FEATURE_ENV) {
    return FEATURE_ENV[key as keyof typeof FEATURE_ENV];
  }
  return undefined;
}

function readEnvFlag(key: string): boolean {
  const raw = readFeatureEnv(key)?.trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

/** Non-empty env present (for keys/URLs). Rejects explicit off values. */
function readEnvPresent(key: string): boolean {
  const raw = readFeatureEnv(key)?.trim();
  if (!raw) return false;
  const lower = raw.toLowerCase();
  if (lower === '0' || lower === 'false' || lower === 'no') return false;
  return true;
}

function isFeatureFlagKey(key: string): boolean {
  return (
    key.startsWith('EXPO_PUBLIC_FEATURE_') ||
    key.startsWith('EXPO_PUBLIC_SERVICE_')
  );
}

function requiredEnvSatisfied(keys: string[] | undefined): boolean {
  if (!keys?.length) return true;
  return keys.every((key) =>
    isFeatureFlagKey(key) ? readEnvFlag(key) : readEnvPresent(key),
  );
}

/**
 * Resolve effective mode:
 * 1. If required env missing → hidden (when alternativeAvailable) else disabled
 * 2. Else apply registry `mode` (user / product priority)
 */
export function resolveFeatureMode(id: FeatureId): FeatureMode {
  const def = FEATURE_REGISTRY[id];

  if (!requiredEnvSatisfied(def.requiredEnvKeys)) {
    return def.alternativeAvailable ? 'hidden' : 'disabled';
  }

  return def.mode;
}

export function getFeatureStatus(id: FeatureId): FeatureStatus {
  const def = FEATURE_REGISTRY[id];
  const mode = resolveFeatureMode(id);
  return {
    id,
    mode,
    reasonKey: mode === 'enabled' ? undefined : def.unavailableReasonKey,
  };
}

export function isFeatureEnabled(id: FeatureId): boolean {
  return getFeatureStatus(id).mode === 'enabled';
}

/** Render the control at all (`enabled` or `disabled`). */
export function shouldRenderFeature(id: FeatureId): boolean {
  return getFeatureStatus(id).mode !== 'hidden';
}

/** User may activate the control. */
export function isFeatureInteractive(id: FeatureId): boolean {
  return getFeatureStatus(id).mode === 'enabled';
}

export function listFeatureStatuses(): FeatureStatus[] {
  return (Object.keys(FEATURE_REGISTRY) as FeatureId[]).map(getFeatureStatus);
}
