import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
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
