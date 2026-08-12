import { Platform } from 'react-native';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  inMemoryPersistence,
  browserPopupRedirectResolver,
  type Auth,
} from 'firebase/auth';

type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
};

function readFirebaseConfig(): FirebaseWebConfig | null {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim();
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim();

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
    messagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
    appId,
  };
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function isFirebaseConfigured(): boolean {
  return readFirebaseConfig() !== null;
}

/**
 * In-memory Auth persistence: we only need a short-lived Firebase ID token,
 * then Nest JWTs live in AsyncStorage. Avoids IndexedDB
 * "Database is closing/hidden" on Expo web / Fast Refresh.
 */
export function getFirebaseAuth(): Auth {
  if (auth) return auth;

  const config = readFirebaseConfig();
  if (!config) {
    throw new Error(
      'Firebase is not configured. Set EXPO_PUBLIC_FIREBASE_* in apps/mobile/.env',
    );
  }

  app = getApps().length ? getApps()[0]! : initializeApp(config);

  try {
    auth = initializeAuth(app, {
      persistence: inMemoryPersistence,
      ...(Platform.OS === 'web'
        ? { popupRedirectResolver: browserPopupRedirectResolver }
        : {}),
    });
  } catch {
    // Hot reload / second call — Auth already initialized on this app.
    auth = getAuth(app);
  }

  return auth;
}
