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
  mergeAuthProfile,
  profileFromUser,
  type AuthProfile,
} from '@/modules/auth/profile';
import {
  fetchUserProfile,
  saveUserProfile,
  type SaveUserProfileInput,
  type UserProfileDoc,
} from '@/modules/profile';

/** Default landing after login when no redirect was stored. */
export const DEFAULT_POST_LOGIN_HREF = '/(tabs)/menu';

export type AuthStatus = 'guest' | 'authenticated';

type AuthContextValue = {
  status: AuthStatus;
  isAuthenticated: boolean;
  isGuest: boolean;
  /** Firebase user when signed in; null for guest. */
  user: User | null;
  /**
   * Auth + Firestore `users/{uid}` merged profile (includes `address`).
   * Null when guest.
   */
  profile: AuthProfile | null;
  /** Raw Firestore profile doc (null if missing / guest). */
  userProfileDoc: UserProfileDoc | null;
  /** False until first `onAuthStateChanged` fires. */
  authReady: boolean;
  /** True while loading Firestore profile for the signed-in user. */
  profileLoading: boolean;
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
  /** Persist Firestore profile (+ Auth displayName) and refresh context. */
  updateUserProfile: (input: SaveUserProfileInput) => Promise<UserProfileDoc>;
  /** Re-fetch Firestore profile for the current user. */
  refreshUserProfile: () => Promise<void>;
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
  const [userProfileDoc, setUserProfileDoc] = useState<UserProfileDoc | null>(
    null,
  );
  const [profileLoading, setProfileLoading] = useState(false);
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured);
  const [stubAuthenticated, setStubAuthenticated] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(
    null,
  );
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  const loadUserProfile = useCallback(async (uid: string) => {
    setProfileLoading(true);
    try {
      const doc = await fetchUserProfile(uid);
      setUserProfileDoc(doc);
    } catch {
      setUserProfileDoc(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthReady(true);
      return;
    }
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (next) => {
      setUser(next);
      if (next) {
        setStubAuthenticated(false);
        setLoginModalVisible(false);
        void loadUserProfile(next.uid);
      } else {
        setUserProfileDoc(null);
        setProfileLoading(false);
      }
      setAuthReady(true);
    });
    return unsub;
  }, [loadUserProfile]);

  const isAuthenticated = Boolean(user) || stubAuthenticated;
  const status: AuthStatus = isAuthenticated ? 'authenticated' : 'guest';
  const profile = useMemo(
    () => mergeAuthProfile(profileFromUser(user), userProfileDoc),
    [user, userProfileDoc],
  );

  const continueAsGuest = useCallback(() => {
    setStubAuthenticated(false);
    setRedirectAfterLogin(null);
    setLoginModalVisible(false);
    setUserProfileDoc(null);
  }, []);

  const markAuthenticated = useCallback(() => {
    setStubAuthenticated(true);
    setLoginModalVisible(false);
  }, []);

  const setAuthUser = useCallback(
    (next: User | null) => {
      setUser(next);
      if (next) {
        setStubAuthenticated(false);
        setLoginModalVisible(false);
        void loadUserProfile(next.uid);
      } else {
        setUserProfileDoc(null);
      }
    },
    [loadUserProfile],
  );

  const refreshUserProfile = useCallback(async () => {
    if (!user) {
      setUserProfileDoc(null);
      return;
    }
    await loadUserProfile(user.uid);
  }, [loadUserProfile, user]);

  const updateUserProfile = useCallback(
    async (input: SaveUserProfileInput) => {
      if (!user) {
        throw new Error('Not signed in');
      }
      const saved = await saveUserProfile(user.uid, input);
      setUserProfileDoc(saved);
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        setUser(auth.currentUser);
      }
      return saved;
    },
    [user],
  );

  const signOut = useCallback(async () => {
    setStubAuthenticated(false);
    setRedirectAfterLogin(null);
    setLoginModalVisible(false);
    setUserProfileDoc(null);
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
      userProfileDoc,
      authReady,
      profileLoading,
      redirectAfterLogin,
      loginModalVisible,
      continueAsGuest,
      markAuthenticated,
      setAuthUser,
      updateUserProfile,
      refreshUserProfile,
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
      userProfileDoc,
      authReady,
      profileLoading,
      redirectAfterLogin,
      loginModalVisible,
      continueAsGuest,
      markAuthenticated,
      setAuthUser,
      updateUserProfile,
      refreshUserProfile,
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
