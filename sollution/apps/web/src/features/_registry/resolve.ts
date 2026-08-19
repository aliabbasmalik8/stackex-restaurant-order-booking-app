import { FEATURE_REGISTRY } from './registry'
import type { FeatureId, FeatureMode, FeatureStatus } from './types'

const FEATURE_ENV = {
  VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  VITE_FEATURE_APPLE_AUTH: import.meta.env.VITE_FEATURE_APPLE_AUTH,
  VITE_FEATURE_GOOGLE_AUTH: import.meta.env.VITE_FEATURE_GOOGLE_AUTH,
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
} as const

function readFeatureEnv(key: string): string | undefined {
  if (key in FEATURE_ENV) {
    return FEATURE_ENV[key as keyof typeof FEATURE_ENV]
  }
  return undefined
}

function readEnvFlag(key: string): boolean {
  const raw = readFeatureEnv(key)?.trim().toLowerCase()
  return raw === '1' || raw === 'true' || raw === 'yes'
}

function readEnvPresent(key: string): boolean {
  const raw = readFeatureEnv(key)?.trim()
  if (!raw) return false
  const lower = raw.toLowerCase()
  if (lower === '0' || lower === 'false' || lower === 'no') return false
  return true
}

function isFeatureFlagKey(key: string): boolean {
  return key.startsWith('VITE_FEATURE_')
}

function requiredEnvSatisfied(keys: string[] | undefined): boolean {
  if (!keys?.length) return true
  return keys.every((key) =>
    isFeatureFlagKey(key) ? readEnvFlag(key) : readEnvPresent(key),
  )
}

export function resolveFeatureMode(id: FeatureId): FeatureMode {
  const def = FEATURE_REGISTRY[id]

  if (!requiredEnvSatisfied(def.requiredEnvKeys)) {
    return def.alternativeAvailable ? 'hidden' : 'disabled'
  }

  return def.mode
}

export function getFeatureStatus(id: FeatureId): FeatureStatus {
  const def = FEATURE_REGISTRY[id]
  const mode = resolveFeatureMode(id)
  return {
    id,
    mode,
    reasonKey: mode === 'enabled' ? undefined : def.unavailableReasonKey,
  }
}

export function isFeatureEnabled(id: FeatureId): boolean {
  return getFeatureStatus(id).mode === 'enabled'
}

export function shouldRenderFeature(id: FeatureId): boolean {
  return getFeatureStatus(id).mode !== 'hidden'
}

export function isFeatureInteractive(id: FeatureId): boolean {
  return getFeatureStatus(id).mode === 'enabled'
}

export function listFeatureStatuses(): FeatureStatus[] {
  return (Object.keys(FEATURE_REGISTRY) as FeatureId[]).map(getFeatureStatus)
}
