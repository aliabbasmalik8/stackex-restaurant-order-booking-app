import { Platform } from 'react-native';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import { AuthError, toAuthError } from './errors';
import { exchangeFirebaseIdToken } from './firebaseSession';
import type { AuthUser } from './profile';

WebBrowser.maybeCompleteAuthSession();

function googleWebClientId(): string {
  return process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? '';
}

/**
 * Web: Firebase config alone (Google provider uses Firebase popup).
 * Native: also needs `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` for expo-auth-session.
 */
export function isGoogleSignInConfigured(): boolean {
  if (!isFirebaseConfigured()) return false;
  if (Platform.OS === 'web') return true;
  return Boolean(googleWebClientId());
}

/**
 * Web: Firebase Google popup → Nest JWT exchange.
 * Native: caller must pass a Google ID token from expo-auth-session.
 */
export async function signInWithGoogleIdToken(
  googleIdToken: string,
): Promise<AuthUser> {
  try {
    if (!isFirebaseConfigured()) {
      throw new AuthError('config_missing');
    }

    const credential = GoogleAuthProvider.credential(googleIdToken);
    const result = await signInWithCredential(getFirebaseAuth(), credential);
    const idToken = await result.user.getIdToken();
    return exchangeFirebaseIdToken(idToken);
  } catch (error) {
    throw toAuthError(error);
  }
}

/** Web: Firebase handles Google OAuth — no separate client id env needed. */
export async function signInWithGooglePopup(): Promise<AuthUser> {
  try {
    if (!isFirebaseConfigured()) {
      throw new AuthError('config_missing');
    }
    if (Platform.OS !== 'web') {
      throw new AuthError('config_missing');
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(getFirebaseAuth(), provider);
    const idToken = await result.user.getIdToken();
    return exchangeFirebaseIdToken(idToken);
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code: unknown }).code === 'string'
    ) {
      const code = (error as { code: string }).code;
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request'
      ) {
        throw new AuthError('unknown', error);
      }
      if (code === 'auth/too-many-requests') {
        throw new AuthError('too_many_requests', error);
      }
    }
    throw toAuthError(error);
  }
}

/**
 * expo-auth-session throws if `webClientId` is undefined.
 * Placeholder when unconfigured so the screen can mount; never promptAsync then.
 */
const UNCONFIGURED_GOOGLE_CLIENT_ID =
  '000000000000-unconfigured.apps.googleusercontent.com';

export function useGoogleAuthRequest() {
  const configuredId = googleWebClientId();
  const webClientId = configuredId || UNCONFIGURED_GOOGLE_CLIENT_ID;
  return Google.useIdTokenAuthRequest({
    clientId: webClientId,
    webClientId,
    iosClientId:
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || undefined,
    androidClientId:
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() || undefined,
  });
}
