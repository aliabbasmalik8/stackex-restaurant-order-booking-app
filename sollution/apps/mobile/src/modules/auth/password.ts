import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { toAuthError } from './errors';

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<User> {
  try {
    const cred = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      email.trim(),
      password,
    );
    return cred.user;
  } catch (error) {
    throw toAuthError(error);
  }
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<User> {
  try {
    const cred = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      input.email.trim(),
      input.password,
    );
    const name = input.displayName?.trim();
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }
    return cred.user;
  } catch (error) {
    throw toAuthError(error);
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(getFirebaseAuth());
  } catch (error) {
    throw toAuthError(error);
  }
}
