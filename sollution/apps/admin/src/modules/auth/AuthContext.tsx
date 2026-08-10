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
} from '@/api/OrderBooking/modules/user';
import {
  clearAuthSession,
  getAccessToken,
  hydrateAuthSession,
  onAuthSessionCleared,
} from '@/utils/auth/session';
import {
  fetchAdminProfile,
  signOutAdmin,
  type AdminUser,
} from '@/modules/auth/api';

type AuthContextValue = {
  user: AdminUser | null;
  isAuthenticated: boolean;
  /** False until session hydrate + optional /me completes. */
  authReady: boolean;
  /** True when VITE_API_URL (or default) can be used. */
  apiConfigured: boolean;
  signOut: () => Promise<void>;
  setUser: (user: AdminUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const apiConfigured = Boolean(
  import.meta.env.VITE_API_URL || 'http://localhost:8000',
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    hydrateAuthSession();
    let cancelled = false;

    void (async () => {
      if (!getAccessToken()) {
        if (!cancelled) {
          setUser(null);
          setAuthReady(true);
        }
        return;
      }
      try {
        const profile = await fetchAdminProfile();
        if (!cancelled) {
          setUser(profile);
          queryClient.setQueryData(USER_PROFILE_QUERY_KEY, profile);
        }
      } catch {
        clearAuthSession();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  useEffect(() => {
    return onAuthSessionCleared(() => {
      setUser(null);
    });
  }, []);

  const signOut = useCallback(async () => {
    await signOutAdmin();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      authReady,
      apiConfigured,
      signOut,
      setUser,
    }),
    [user, authReady, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
