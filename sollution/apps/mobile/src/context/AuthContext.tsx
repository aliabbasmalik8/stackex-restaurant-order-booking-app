import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/** Default landing after login when no redirect was stored. */
export const DEFAULT_POST_LOGIN_HREF = '/(tabs)/menu';

export type AuthStatus = 'guest' | 'authenticated';

type AuthContextValue = {
  status: AuthStatus;
  isAuthenticated: boolean;
  isGuest: boolean;
  /** Intended route after a successful login (null → default home). */
  redirectAfterLogin: string | null;
  loginModalVisible: boolean;
  continueAsGuest: () => void;
  /** Stub / real login success — marks session authenticated. */
  markAuthenticated: () => void;
  signOut: () => void;
  /**
   * If authenticated, returns true (caller may proceed).
   * If guest, stores `redirectTo`, opens login modal, returns false.
   */
  requireAuth: (redirectTo?: string) => boolean;
  closeLoginModal: () => void;
  /** Read + clear redirect (or default). Call after markAuthenticated. */
  takePostLoginRedirect: () => string;
  /** Open modal with an optional redirect (without a boolean gate). */
  openLoginModal: (redirectTo?: string) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('guest');
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(
    null,
  );
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  const continueAsGuest = useCallback(() => {
    setStatus('guest');
    setRedirectAfterLogin(null);
    setLoginModalVisible(false);
  }, []);

  const markAuthenticated = useCallback(() => {
    setStatus('authenticated');
    setLoginModalVisible(false);
  }, []);

  const signOut = useCallback(() => {
    setStatus('guest');
    setRedirectAfterLogin(null);
    setLoginModalVisible(false);
  }, []);

  const openLoginModal = useCallback((redirectTo?: string) => {
    if (redirectTo) setRedirectAfterLogin(redirectTo);
    setLoginModalVisible(true);
  }, []);

  const requireAuth = useCallback(
    (redirectTo: string = DEFAULT_POST_LOGIN_HREF) => {
      if (status === 'authenticated') return true;
      setRedirectAfterLogin(redirectTo);
      setLoginModalVisible(true);
      return false;
    },
    [status],
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
      isAuthenticated: status === 'authenticated',
      isGuest: status === 'guest',
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
