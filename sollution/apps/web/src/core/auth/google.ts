import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase'
import { AuthError, toAuthError } from './errors'
import { exchangeFirebaseIdToken } from './firebaseSession'
import type { AuthUser } from './profile'

export function isGoogleSignInConfigured(): boolean {
  return isFirebaseConfigured()
}

export async function signInWithGooglePopup(): Promise<AuthUser> {
  try {
    if (!isFirebaseConfigured()) {
      throw new AuthError('config_missing')
    }

    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    const result = await signInWithPopup(getFirebaseAuth(), provider)
    const idToken = await result.user.getIdToken()
    return exchangeFirebaseIdToken(idToken)
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code: unknown }).code === 'string'
    ) {
      const code = (error as { code: string }).code
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        throw new AuthError('unknown', error)
      }
      if (code === 'auth/too-many-requests') {
        throw new AuthError('too_many_requests', error)
      }
    }
    throw toAuthError(error)
  }
}
