import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Action-level auth gate (e.g. profile avatar, cart continue, tab press).
 *
 * Guest → open login modal, store optional `redirectTo`, return false (caller
 * should not navigate). Authenticated → run `fn`, return true.
 *
 * Pass no `fn` when you only need the boolean (e.g. tab `preventDefault`).
 *
 * @example
 * const runAuthed = useAuthAction('/(tabs)/profile');
 * onOpenProfile={() => runAuthed(() => router.push('/(tabs)/profile'))}
 * // tabPress: if (!runAuthed()) e.preventDefault();
 */
export function useAuthAction(redirectTo?: string | null) {
  const { requireAuth } = useAuth();

  return useCallback(
    (fn?: () => void): boolean => {
      if (!requireAuth(redirectTo)) return false;
      fn?.();
      return true;
    },
    [requireAuth, redirectTo],
  );
}
