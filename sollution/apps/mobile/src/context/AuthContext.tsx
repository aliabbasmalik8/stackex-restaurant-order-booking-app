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
import { signOutUser } from '@/modules/auth/password';
import {
  profileFromUser,
  type AuthProfile,
} from '@/modules/auth/profile';

/** Default landing after login when no redirect was stored. */
export const DEFAULT_POST_LOGIN_HREF = '/(tabs)/menu';

export type AuthStatus = 'guest' | 'authenticated';

type AuthContextValue = {
  status: AuthStatus;
  isAuthenticated: boolean;
  isGuest: boolean;
  /** Firebase user when signed in; null for guest. */
  user: User | null;
  /** Derived display fields from `user` (null when guest). */
  profile: AuthProfile | null;
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
  /**
   * Push the latest Firebase user into context (e.g. after `updateProfile`).
   * Prefer this when Auth state may not re-emit immediately.
   */
  setAuthUser: (next: User | null) => void;
  signOut: () => Promise<void>;
  /**
   * If authenticated, returns true (caller may proceed).
   * If guest, optionally stores `redirectTo`, opens login modal, returns false.
   * Prefer `rememberPostLoginRedirect` + navigate to `/` for gate hooks.
   */
  requireAuth: (redirectTo?: string | null) => boolean;
  closeLoginModal: () => void;
  /** Read + clear redirect (or default). Call after successful login. */
  takePostLoginRedirect: () => string;
  /**
   * Store post-login route without opening the guest modal.
   * `undefined` → leave unchanged; `null` → clear; `string` → set.
   */
  rememberPostLoginRedirect: (redirectTo?: string | null) => void;
  /** Open guest sheet; `redirectTo` is optional. */
  openLoginModal: (redirectTo?: string | null) => void;
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
  const profile = useMemo(() => profileFromUser(user), [user]);

  const continueAsGuest = useCallback(() => {
    setStubAuthenticated(false);
    setRedirectAfterLogin(null);
    setLoginModalVisible(false);
  }, []);

  const markAuthenticated = useCallback(() => {
    setStubAuthenticated(true);
    setLoginModalVisible(false);
  }, []);

  const setAuthUser = useCallback((next: User | null) => {
    setUser(next);
    if (next) {
      setStubAuthenticated(false);
      setLoginModalVisible(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setStubAuthenticated(false);
    setRedirectAfterLogin(null);
    setLoginModalVisible(false);
    if (isFirebaseConfigured && user) {
      await signOutUser();
    }
    setUser(null);
  }, [user]);

  const openLoginModal = useCallback((redirectTo?: string | null) => {
    if (redirectTo != null) setRedirectAfterLogin(redirectTo);
    setLoginModalVisible(true);
  }, []);

  const rememberPostLoginRedirect = useCallback(
    (redirectTo?: string | null) => {
      if (redirectTo === undefined) return;
      setRedirectAfterLogin(redirectTo);
    },
    [],
  );

  const requireAuth = useCallback(
    (redirectTo?: string | null) => {
      if (isAuthenticated) return true;
      if (redirectTo !== undefined) {
        setRedirectAfterLogin(redirectTo === null ? null : redirectTo);
      } else {
        setRedirectAfterLogin(DEFAULT_POST_LOGIN_HREF);
      }
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
      profile,
      authReady,
      redirectAfterLogin,
      loginModalVisible,
      continueAsGuest,
      markAuthenticated,
      setAuthUser,
      signOut,
      requireAuth,
      closeLoginModal,
      takePostLoginRedirect,
      rememberPostLoginRedirect,
      openLoginModal,
    }),
    [
      status,
      isAuthenticated,
      user,
      profile,
      authReady,
      redirectAfterLogin,
      loginModalVisible,
      continueAsGuest,
      markAuthenticated,
      setAuthUser,
      signOut,
      requireAuth,
      closeLoginModal,
      takePostLoginRedirect,
      rememberPostLoginRedirect,
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
