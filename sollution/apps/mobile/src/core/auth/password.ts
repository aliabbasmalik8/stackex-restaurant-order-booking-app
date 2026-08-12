import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { ApiError } from '@/api/OrderBooking/client';
import { clearAuthSession } from '@/utils/auth/session';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import { AuthError, toAuthError } from './errors';
import { exchangeFirebaseIdToken } from './firebaseSession';
import type { AuthUser } from './profile';

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthUser> {
  try {
    if (!isFirebaseConfigured()) {
      throw new AuthError('config_missing');
    }

    const credential = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      email.trim(),
      password,
    );
    const idToken = await credential.user.getIdToken();
    return exchangeFirebaseIdToken(idToken);
  } catch (error) {
    throw toAuthError(error);
  }
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<AuthUser> {
  try {
    if (!isFirebaseConfigured()) {
      throw new AuthError('config_missing');
    }

    const auth = getFirebaseAuth();
    const credential = await createUserWithEmailAndPassword(
      auth,
      input.email.trim(),
      input.password,
    );

    const displayName = input.displayName?.trim();
    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }

    const idToken = await credential.user.getIdToken(true);
    return exchangeFirebaseIdToken(idToken);
  } catch (error) {
    throw toAuthError(error);
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await clearAuthSession();
    if (isFirebaseConfigured()) {
      await firebaseSignOut(getFirebaseAuth());
    }
  } catch (error) {
    throw toAuthError(error);
  }
}

export function isApiAuthError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
