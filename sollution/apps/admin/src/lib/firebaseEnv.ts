/**
 * Firebase Web client env keys for the admin SPA.
 * Vite exposes `FIREBASE_*` via `envPrefix` in vite.config.ts.
 */
export const FIREBASE_ENV_VAR_KEYS = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID',
] as const

export type FirebaseEnvVarKey = (typeof FIREBASE_ENV_VAR_KEYS)[number]

export function readFirebaseEnv(): Record<FirebaseEnvVarKey, string | undefined> {
  return {
    FIREBASE_API_KEY: import.meta.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: import.meta.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: import.meta.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: import.meta.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: import.meta.env.FIREBASE_APP_ID,
  }
}

export function isFirebaseEnvComplete(
  env: Record<FirebaseEnvVarKey, string | undefined> = readFirebaseEnv(),
): boolean {
  return FIREBASE_ENV_VAR_KEYS.every((key) => Boolean(env[key]?.trim()))
}
