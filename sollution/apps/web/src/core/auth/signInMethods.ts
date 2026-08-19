import {
  EmailAuthProvider,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase'
import { AuthError } from './errors'

export type SignInMethodsSnapshot = {
  email: string | null
  hasPassword: boolean
  isGoogleConnected: boolean
  hasFirebaseSession: boolean
}

export function readSignInMethods(user: User | null): SignInMethodsSnapshot {
  const providers = user?.providerData ?? []
  return {
    email: user?.email?.trim() || null,
    hasPassword: providers.some(
      (provider) => provider.providerId === EmailAuthProvider.PROVIDER_ID,
    ),
    isGoogleConnected: providers.some(
      (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID,
    ),
    hasFirebaseSession: Boolean(user),
  }
}

export function requireFirebaseUser(): User {
  if (!isFirebaseConfigured()) {
    throw new AuthError('config_missing')
  }
  const user = getFirebaseAuth().currentUser
  if (!user) {
    throw new AuthError('requires_recent_login')
  }
  return user
}

export async function waitForFirebaseUser(): Promise<User | null> {
  if (!isFirebaseConfigured()) return null
  const auth = getFirebaseAuth()
  await auth.authStateReady()
  return auth.currentUser
}
