import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { isExpoGo } from '@/lib/expoGo';
import {
  isGoogleSignInConfigured,
  linkGoogleIdToken,
  linkGooglePopup,
  useGoogleAuthRequest,
} from './google';
import { AuthError, toAuthError } from './errors';

type ConnectGoogleState = {
  connectGoogle: () => Promise<void>;
  ready: boolean;
  loading: boolean;
};

/** Link Google onto the current Firebase user (profile sign-in methods). */
export function useConnectGoogle(): ConnectGoogleState {
  const [loading, setLoading] = useState(false);
  const [request, response, promptAsync] = useGoogleAuthRequest();
  const pendingResolve = useRef<(() => void) | null>(null);
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
        await linkGoogleIdToken(idToken);
        pendingResolve.current?.();
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

  const connectGoogle = useCallback(async (): Promise<void> => {
    if (!isGoogleSignInConfigured()) {
      throw new AuthError('config_missing');
    }
    if (isExpoGo()) {
      throw new AuthError('expo_go');
    }

    setLoading(true);
    try {
      if (Platform.OS === 'web') {
        await linkGooglePopup();
        setLoading(false);
        return;
      }

      if (!request) {
        setLoading(false);
        throw new AuthError('config_missing');
      }

      await new Promise<void>((resolve, reject) => {
        pendingResolve.current = resolve;
        pendingReject.current = reject;
        void promptAsync().then((result) => {
          if (result.type === 'dismiss' || result.type === 'cancel') {
            pendingReject.current?.(new AuthError('unknown', result));
            pendingResolve.current = null;
            pendingReject.current = null;
            setLoading(false);
          }
        });
      });
    } catch (error) {
      setLoading(false);
      throw toAuthError(error);
    }
  }, [promptAsync, request]);

  return {
    connectGoogle,
    ready:
      isGoogleSignInConfigured() &&
      (Platform.OS === 'web' || Boolean(request)),
    loading,
  };
}
