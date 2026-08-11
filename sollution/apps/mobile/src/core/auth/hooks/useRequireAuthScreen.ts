import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export type UseRequireAuthScreenOptions = {
  /**
   * Stored for post-login navigation, then guest is sent to the sign-in page (`/`).
   * Omit or pass `null` to stay on the route and render `AuthRequiredView`.
   */
  redirectTo?: string | null;
};

export type UseRequireAuthScreenResult = {
  /** False until auth session hydrate has finished once. */
  authReady: boolean;
  /** True only when the user may see the protected screen. */
  allowed: boolean;
};

/**
 * Screen-level auth gate. Call at the top of a route.
 *
 * - `redirectTo: string` — wait `authReady`, remember redirect, `replace` to `/` (sign-in).
 * - omit / `null` — wait `authReady`, stay put (`allowed: false`); render `AuthRequiredView`.
 *
 * Does not open the guest login modal.
 */
export function useRequireAuthScreen(
  options: UseRequireAuthScreenOptions = {},
): UseRequireAuthScreenResult {
  const { redirectTo } = options;

  const router = useRouter();
  const { authReady, isAuthenticated, rememberPostLoginRedirect } = useAuth();
  const gated = useRef(false);

  useEffect(() => {
    if (!authReady || isAuthenticated || gated.current) return;
    // Stay on-screen for AuthRequiredView.
    if (redirectTo == null) return;

    gated.current = true;
    rememberPostLoginRedirect(redirectTo);
    router.replace('/');
  }, [
    authReady,
    isAuthenticated,
    redirectTo,
    rememberPostLoginRedirect,
    router,
  ]);

  // Allow re-gate if user signs out while on this screen
  useEffect(() => {
    if (isAuthenticated) {
      gated.current = false;
    }
  }, [isAuthenticated]);

  return {
    authReady,
    allowed: authReady && isAuthenticated,
  };
}
