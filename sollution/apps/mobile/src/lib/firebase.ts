import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { assertFirebaseConfigured } from '@/lib/errors';
import {
  isFirebaseEnvComplete,
  readFirebaseEnv,
} from '@/lib/firebaseEnv';

export {
  FIREBASE_ENV_VAR_KEYS,
  isFirebaseEnvComplete,
  readFirebaseEnv,
} from '@/lib/firebaseEnv';

const env = readFirebaseEnv();

const firebaseConfig = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = isFirebaseEnvComplete(env);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: FirebaseAuth.Auth | null = null;

type AuthWithRnPersistence = typeof FirebaseAuth & {
  getReactNativePersistence?: (
    storage: typeof ReactNativeAsyncStorage,
  ) => FirebaseAuth.Persistence;
};

export function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  assertFirebaseConfigured(isFirebaseConfigured);
  app =
    getApps().length === 0
      ? initializeApp(firebaseConfig)
      : getApp();
  return app;
}

export function getDb(): Firestore {
  if (db) return db;
  db = getFirestore(getFirebaseApp());
  return db;
}

/**
 * Firebase Auth with AsyncStorage persistence on React Native.
 * Falls back to `getAuth` when RN persistence isn’t available (e.g. web).
 */
export function getFirebaseAuth(): FirebaseAuth.Auth {
  if (auth) return auth;
  const firebaseApp = getFirebaseApp();
  const authMod = FirebaseAuth as AuthWithRnPersistence;
  try {
    if (authMod.getReactNativePersistence) {
      auth = FirebaseAuth.initializeAuth(firebaseApp, {
        persistence: authMod.getReactNativePersistence(ReactNativeAsyncStorage),
      });
    } else {
      auth = FirebaseAuth.getAuth(firebaseApp);
    }
  } catch {
    // Already initialized (Fast Refresh / second call)
    auth = FirebaseAuth.getAuth(firebaseApp);
  }
  return auth;
}
