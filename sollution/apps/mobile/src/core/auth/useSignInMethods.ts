import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { onAuthStateChanged, onIdTokenChanged } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import {
  readSignInMethods,
  type SignInMethodsSnapshot,
} from './signInMethods';

const EMPTY: SignInMethodsSnapshot = {
  email: null,
  hasPassword: false,
  isGoogleConnected: false,
  hasFirebaseSession: false,
};

export type UseSignInMethodsResult = SignInMethodsSnapshot & {
  ready: boolean;
  refresh: () => Promise<void>;
};

/** Live Firebase provider list: password linked, Google linked, email. */
export function useSignInMethods(): UseSignInMethodsResult {
  const [snapshot, setSnapshot] = useState<SignInMethodsSnapshot>(EMPTY);
  const [ready, setReady] = useState(!isFirebaseConfigured());

  const refresh = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setSnapshot(EMPTY);
      setReady(true);
      return;
    }
    const user = getFirebaseAuth().currentUser;
    if (user) {
      try {
        await user.reload();
      } catch {
        // Session may have expired; still re-read currentUser.
      }
    }
    setSnapshot(readSignInMethods(getFirebaseAuth().currentUser));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setReady(true);
      return;
    }
    const auth = getFirebaseAuth();
    const apply = (user: Parameters<typeof readSignInMethods>[0]) => {
      setSnapshot(readSignInMethods(user));
      setReady(true);
    };
    const unsubAuth = onAuthStateChanged(auth, apply);
    // Linking a password/Google provider often does not fire onAuthStateChanged.
    const unsubToken = onIdTokenChanged(auth, apply);
    return () => {
      unsubAuth();
      unsubToken();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { ...snapshot, ready, refresh };
}
