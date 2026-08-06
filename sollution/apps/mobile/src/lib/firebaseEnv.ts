/**
 * Firebase Web client env keys.
 *
 * These are the ONLY Firebase env vars our main backend injects when
 * provisioning a customer preview. Do not add new Expo Firebase keys
 * in this app unless the main backend is updated to provision them too.
 */
export const FIREBASE_ENV_VAR_KEYS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const;

export type FirebaseEnvVarKey = (typeof FIREBASE_ENV_VAR_KEYS)[number];

export function readFirebaseEnv(): Record<FirebaseEnvVarKey, string | undefined> {
  return {
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
}

export function isFirebaseEnvComplete(
  env: Record<FirebaseEnvVarKey, string | undefined> = readFirebaseEnv(),
): boolean {
  return FIREBASE_ENV_VAR_KEYS.every((key) => Boolean(env[key]?.trim()));
}
