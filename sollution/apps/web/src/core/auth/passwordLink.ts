import {
  EmailAuthProvider,
  linkWithCredential,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  updatePassword,
} from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase'
import { AuthError, toAuthError } from './errors'
import { requireFirebaseUser, waitForFirebaseUser } from './signInMethods'

export async function addPasswordToAccount(password: string): Promise<void> {
  try {
    await waitForFirebaseUser()
    const user = requireFirebaseUser()
    const email = user.email?.trim()
    if (!email) {
      throw new AuthError('invalid_email')
    }
    if (password.trim().length < 6) {
      throw new AuthError('weak_password')
    }
    const credential = EmailAuthProvider.credential(email, password)
    await linkWithCredential(user, credential)
    await user.reload()
  } catch (error) {
    throw toAuthError(error)
  }
}

export async function changeAccountPassword(input: {
  email?: string | null
  currentPassword: string
  nextPassword: string
}): Promise<void> {
  try {
    if (!isFirebaseConfigured()) {
      throw new AuthError('config_missing')
    }
    if (input.nextPassword.trim().length < 6) {
      throw new AuthError('weak_password')
    }

    const auth = getFirebaseAuth()
    await auth.authStateReady()
    if (!auth.currentUser) {
      const email = input.email?.trim()
      if (!email) {
        throw new AuthError('requires_recent_login')
      }
      await signInWithEmailAndPassword(auth, email, input.currentPassword)
    }

    const user = requireFirebaseUser()
    const email = user.email?.trim()
    if (!email) {
      throw new AuthError('invalid_email')
    }
    const current = EmailAuthProvider.credential(email, input.currentPassword)
    await reauthenticateWithCredential(user, current)
    await updatePassword(user, input.nextPassword)
    await user.reload()
  } catch (error) {
    throw toAuthError(error)
  }
}
