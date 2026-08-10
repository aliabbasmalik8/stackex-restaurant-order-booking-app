import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
  type Unsubscribe,
} from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'
import { AuthError, toAuthError } from './errors'

/** Custom claim checked by Firestore rules: `request.auth.token.admin == true`. */
export async function userHasAdminClaim(
  user: User,
  forceRefresh = false,
): Promise<boolean> {
  const token = await user.getIdTokenResult(forceRefresh)
  return token.claims.admin === true
}

/**
 * Email/password sign-in. Rejects (and signs out) if the user lacks `admin: true`.
 */
export async function signInAdmin(
  email: string,
  password: string,
): Promise<User> {
  try {
    const cred = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      email.trim(),
      password,
    )
    const isAdmin = await userHasAdminClaim(cred.user, true)
    if (!isAdmin) {
      await firebaseSignOut(getFirebaseAuth())
      throw new AuthError('not_admin')
    }
    return cred.user
  } catch (error) {
    throw toAuthError(error)
  }
}

export async function signOutAdmin(): Promise<void> {
  try {
    await firebaseSignOut(getFirebaseAuth())
  } catch (error) {
    throw toAuthError(error)
  }
}

/**
 * Subscribe to auth changes. Non-admin sessions are signed out automatically.
 */
export function subscribeAdminAuth(
  onChange: (user: User | null) => void,
): Unsubscribe {
  return onAuthStateChanged(getFirebaseAuth(), (user) => {
    void (async () => {
      if (!user) {
        onChange(null)
        return
      }
      try {
        const isAdmin = await userHasAdminClaim(user)
        if (!isAdmin) {
          await firebaseSignOut(getFirebaseAuth())
          onChange(null)
          return
        }
        onChange(user)
      } catch {
        onChange(null)
      }
    })()
  })
}
