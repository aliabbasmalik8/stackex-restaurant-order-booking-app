import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import {
  isFirebaseEnvComplete,
  readFirebaseEnv,
} from '@/lib/firebaseEnv'

export {
  FIREBASE_ENV_VAR_KEYS,
  isFirebaseEnvComplete,
  readFirebaseEnv,
} from '@/lib/firebaseEnv'

const env = readFirebaseEnv()

const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
}

export const isFirebaseConfigured = isFirebaseEnvComplete(env)

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null

function assertFirebaseConfigured() {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured. Fill the six FIREBASE_* keys in .env',
    )
  }
}

export function getFirebaseApp(): FirebaseApp {
  if (app) return app
  assertFirebaseConfigured()
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  return app
}

export function getDb(): Firestore {
  if (db) return db
  db = getFirestore(getFirebaseApp())
  return db
}

export function getFirebaseAuth(): Auth {
  if (auth) return auth
  auth = getAuth(getFirebaseApp())
  return auth
}
