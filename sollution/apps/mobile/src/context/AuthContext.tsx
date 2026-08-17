import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  USER_PROFILE_QUERY_KEY,
  userApi,
  type UserProfile,
} from '@/api/OrderBooking/modules/user';
import { signOutUser } from '@/core/auth/password';
import {
  authUserFromProfile,
  mergeAuthProfile,
  profileFromApiUser,
  profileFromUser,
  type AuthProfile,
  type AuthUser,
} from '@/core/auth/profile';
import type {
  SaveUserProfileInput,
  UserProfileDoc,
} from '@/core/profile';
import {
  clearAuthSession,
  getAccessToken,
  hydrateAuthSession,
  onAuthSessionCleared,
} from '@/utils/auth/session';

/** Default landing after login when no redirect was stored. */
export const DEFAULT_POST_LOGIN_HREF = '/(tabs)/menu';

export type AuthStatus = 'guest' | 'authenticated';

type AuthContextValue = {
  status: AuthStatus;
  isAuthenticated: boolean;
  isGuest: boolean;
  /** Nest-backed user when signed in; null for guest. */
  user: AuthUser | null;
  /**
   * Auth + profile merged.
   * Null when guest.
   */
  profile: AuthProfile | null;
  /** Profile doc shape for screens that still expect it. */
  userProfileDoc: UserProfileDoc | null;
  /** False until session hydrate + optional /me completes. */
  authReady: boolean;
  /** True while loading profile for the signed-in user. */
  profileLoading: boolean;
  /** Intended route after a successful login (null → default home). */
  redirectAfterLogin: string | null;
  loginModalVisible: boolean;
  continueAsGuest: () => void;
  /**
   * Local UI helper for stub providers (Apple/Google/OTP).
   */
  markAuthenticated: () => void;
  /** Push latest user into context after login/signup. */
  setAuthUser: (next: AuthUser | null, profile?: UserProfile | null) => void;
  /** Persist profile via PATCH /users/me and refresh context. */
  updateUserProfile: (input: SaveUserProfileInput) => Promise<UserProfileDoc>;
  /** Re-fetch /users/me for the current session. */
  refreshUserProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  requireAuth: (redirectTo?: string | null) => boolean;
  closeLoginModal: () => void;
  takePostLoginRedirect: () => string;
  rememberPostLoginRedirect: (redirectTo?: string | null) => void;
  openLoginModal: (redirectTo?: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toProfileDoc(user: UserProfile): UserProfileDoc {
  return {
    uid: user.id,
    contactPhone: user.contactPhone,
    createdAt:
      typeof user.created_at === 'string'
        ? user.created_at
        : new Date(user.created_at).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [apiProfile, setApiProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [stubAuthenticated, setStubAuthenticated] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(
    null,
  );
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  const applyProfile = useCallback(
    (profile: UserProfile | null) => {
      setApiProfile(profile);
      if (profile) {
        setUser(authUserFromProfile(profile));
        queryClient.setQueryData(USER_PROFILE_QUERY_KEY, profile);
      } else {
        setUser(null);
        queryClient.removeQueries({ queryKey: USER_PROFILE_QUERY_KEY });
      }
    },
    [queryClient],
  );

  const loadUserProfile = useCallback(async () => {
    if (!getAccessToken()) {
      applyProfile(null);
      return;
    }
    setProfileLoading(true);
    try {
      const profile = await userApi.getProfile();
      applyProfile(profile);
      setStubAuthenticated(false);
      setLoginModalVisible(false);
    } catch {
      await clearAuthSession();
      applyProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, [applyProfile]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await hydrateAuthSession();
      if (cancelled) return;
      if (getAccessToken()) {
        await loadUserProfile();
      }
      if (!cancelled) setAuthReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadUserProfile]);

  useEffect(() => {
    return onAuthSessionCleared(() => {
      applyProfile(null);
      setStubAuthenticated(false);
    });
  }, [applyProfile]);

  const userProfileDoc = useMemo(
    () => (apiProfile ? toProfileDoc(apiProfile) : null),
    [apiProfile],
  );

  const isAuthenticated = Boolean(user) || stubAuthenticated;
  const status: AuthStatus = isAuthenticated ? 'authenticated' : 'guest';
  const profile = useMemo(() => {
    if (apiProfile) return profileFromApiUser(apiProfile);
    return mergeAuthProfile(profileFromUser(user), userProfileDoc);
  }, [apiProfile, user, userProfileDoc]);

  const continueAsGuest = useCallback(() => {
    setStubAuthenticated(false);
    setRedirectAfterLogin(null);
    setLoginModalVisible(false);
  }, []);

  const markAuthenticated = useCallback(() => {
    setStubAuthenticated(true);
    setLoginModalVisible(false);
  }, []);

  const setAuthUser = useCallback(
    (next: AuthUser | null, profile?: UserProfile | null) => {
      if (profile) {
        applyProfile(profile);
      } else if (next) {
        setUser(next);
        setStubAuthenticated(false);
        setLoginModalVisible(false);
        void loadUserProfile();
      } else {
        applyProfile(null);
      }
    },
    [applyProfile, loadUserProfile],
  );

  const refreshUserProfile = useCallback(async () => {
    if (!getAccessToken()) {
      applyProfile(null);
      return;
    }
    await loadUserProfile();
  }, [applyProfile, loadUserProfile]);

  const updateUserProfile = useCallback(
    async (input: SaveUserProfileInput) => {
      if (!user) {
        throw new Error('Not signed in');
      }
      const saved = await userApi.updateProfile({
        name: input.displayName,
        contactPhone: input.contactPhone,
      });
      applyProfile(saved);
      return toProfileDoc(saved);
    },
    [applyProfile, user],
  );

  const signOut = useCallback(async () => {
    setStubAuthenticated(false);
    setRedirectAfterLogin(null);
    setLoginModalVisible(false);
    await signOutUser();
    applyProfile(null);
    queryClient.clear();
  }, [applyProfile, queryClient]);

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
