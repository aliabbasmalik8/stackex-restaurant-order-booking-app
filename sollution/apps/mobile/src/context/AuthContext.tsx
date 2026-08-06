import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import { signOutUser } from '@/modules/auth';

/** Default landing after login when no redirect was stored. */
export const DEFAULT_POST_LOGIN_HREF = '/(tabs)/menu';

export type AuthStatus = 'guest' | 'authenticated';

type AuthContextValue = {
  status: AuthStatus;
  isAuthenticated: boolean;
  isGuest: boolean;
  /** Firebase user when signed in; null for guest. */
  user: User | null;
  /** False until first `onAuthStateChanged` fires. */
  authReady: boolean;
  /** Intended route after a successful login (null → default home). */
  redirectAfterLogin: string | null;
  loginModalVisible: boolean;
  continueAsGuest: () => void;
  /**
   * Local UI helper for stub providers (Apple/Google/OTP).
   * Password auth relies on `onAuthStateChanged` instead.
   */
  markAuthenticated: () => void;
  signOut: () => Promise<void>;
  /**
   * If authenticated, returns true (caller may proceed).
   * If guest, stores `redirectTo`, opens login modal, returns false.
   */
  requireAuth: (redirectTo?: string) => boolean;
  closeLoginModal: () => void;
  /** Read + clear redirect (or default). Call after successful login. */
  takePostLoginRedirect: () => string;
  /** Open modal with an optional redirect (without a boolean gate). */
  openLoginModal: (redirectTo?: string) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured);
  const [stubAuthenticated, setStubAuthenticated] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(
    null,
  );
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthReady(true);
      return;
    }
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (next) => {
      setUser(next);
      if (next) setStubAuthenticated(false);
      setAuthReady(true);
      if (next) setLoginModalVisible(false);
    });
    return unsub;
  }, []);

  const isAuthenticated = Boolean(user) || stubAuthenticated;
  const status: AuthStatus = isAuthenticated ? 'authenticated' : 'guest';

  const continueAsGuest = useCallback(() => {
    setStubAuthenticated(false);
    setRedirectAfterLogin(null);
    setLoginModalVisible(false);
  }, []);

  const markAuthenticated = useCallback(() => {
    setStubAuthenticated(true);
    setLoginModalVisible(false);
  }, []);

  const signOut = useCallback(async () => {
    setStubAuthenticated(false);
    setRedirectAfterLogin(null);
    setLoginModalVisible(false);
    if (isFirebaseConfigured && user) {
      await signOutUser();
    }
  }, [user]);

  const openLoginModal = useCallback((redirectTo?: string) => {
    if (redirectTo) setRedirectAfterLogin(redirectTo);
    setLoginModalVisible(true);
  }, []);

  const requireAuth = useCallback(
    (redirectTo: string = DEFAULT_POST_LOGIN_HREF) => {
      if (isAuthenticated) return true;
      setRedirectAfterLogin(redirectTo);
      setLoginModalVisible(true);
      return false;
    },
    [isAuthenticated],
  );

  const closeLoginModal = useCallback(() => {
    setLoginModalVisible(false);
  }, []);

  const takePostLoginRedirect = useCallback(() => {
    const target = redirectAfterLogin ?? DEFAULT_POST_LOGIN_HREF;
    setRedirectAfterLogin(null);
    return target;
  }, [redirectAfterLogin]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      isAuthenticated,
      isGuest: !isAuthenticated,
      user,
      authReady,
      redirectAfterLogin,
      loginModalVisible,
      continueAsGuest,
      markAuthenticated,
      signOut,
      requireAuth,
      closeLoginModal,
      takePostLoginRedirect,
      openLoginModal,
    }),
    [
      status,
      isAuthenticated,
      user,
      authReady,
      redirectAfterLogin,
      loginModalVisible,
      continueAsGuest,
      markAuthenticated,
      signOut,
      requireAuth,
      closeLoginModal,
      takePostLoginRedirect,
      openLoginModal,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
