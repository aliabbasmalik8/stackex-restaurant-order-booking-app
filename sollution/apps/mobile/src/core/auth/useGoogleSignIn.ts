import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { isExpoGo } from '@/lib/expoGo';
import {
  isGoogleSignInConfigured,
  signInWithGoogleIdToken,
  signInWithGooglePopup,
  useGoogleAuthRequest,
} from './google';
import { AuthError, toAuthError } from './errors';
import type { AuthUser } from './profile';

type GoogleSignInState = {
  signInWithGoogle: () => Promise<AuthUser>;
  ready: boolean;
  loading: boolean;
};

/**
 * Google → Firebase → Nest JWT.
 * Web uses Firebase popup; native uses expo-auth-session id token.
 */
export function useGoogleSignIn(): GoogleSignInState {
  const [loading, setLoading] = useState(false);
  const [request, response, promptAsync] = useGoogleAuthRequest();
  const pendingResolve = useRef<((user: AuthUser) => void) | null>(null);
  const pendingReject = useRef<((error: unknown) => void) | null>(null);

  useEffect(() => {
    if (!response) return;

    const settle = async () => {
      if (response.type !== 'success') {
        pendingReject.current?.(
          new AuthError(
            response.type === 'dismiss' || response.type === 'cancel'
              ? 'unknown'
              : 'invalid_credential',
            response,
          ),
        );
        pendingResolve.current = null;
        pendingReject.current = null;
        setLoading(false);
        return;
      }

      try {
        const idToken = response.params.id_token;
        if (!idToken) {
          throw new AuthError('invalid_credential', response);
        }
        const user = await signInWithGoogleIdToken(idToken);
        pendingResolve.current?.(user);
      } catch (error) {
        pendingReject.current?.(toAuthError(error));
      } finally {
        pendingResolve.current = null;
        pendingReject.current = null;
        setLoading(false);
      }
    };

    void settle();
  }, [response]);

  const signInWithGoogle = useCallback(async (): Promise<AuthUser> => {
    if (!isGoogleSignInConfigured()) {
      throw new AuthError('config_missing');
    }
    if (isExpoGo()) {
      throw new AuthError('expo_go');
    }

    setLoading(true);
    try {
      if (Platform.OS === 'web') {
        const user = await signInWithGooglePopup();
        setLoading(false);
        return user;
      }

      if (!request) {
        setLoading(false);
        throw new AuthError('config_missing');
      }

      return await new Promise<AuthUser>((resolve, reject) => {
        pendingResolve.current = resolve;
        pendingReject.current = reject;
        void promptAsync().then((result) => {
          if (result.type !== 'success') {
            // response effect also runs; if prompt returns early cancel, settle here
            if (result.type === 'dismiss' || result.type === 'cancel') {
              pendingReject.current?.(new AuthError('unknown', result));
              pendingResolve.current = null;
              pendingReject.current = null;
              setLoading(false);
            }
          }
        });
      });
    } catch (error) {
      setLoading(false);
      throw toAuthError(error);
    }
  }, [promptAsync, request]);

  return {
    signInWithGoogle,
    ready: isGoogleSignInConfigured() && (Platform.OS === 'web' || Boolean(request)),
    loading,
  };
}
