import { settingsApi } from '@/api/OrderBooking/modules/settings';
import { SETTINGS_FETCH_RETRY_MS } from './catalog';
import { resolveAppSettings } from './resolve';
import { setAppSettings } from './store';

let retryTimer: ReturnType<typeof setTimeout> | null = null;

function clearRetry(): void {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
}

function scheduleRetry(): void {
  if (retryTimer) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    void refreshAppSettings().catch(() => {
      scheduleRetry();
    });
  }, SETTINGS_FETCH_RETRY_MS);
}

/**
 * Always fetch `/settings/public`.
 * On failure → catalog defaults, then retry after SETTINGS_FETCH_RETRY_MS.
 * No AsyncStorage cache.
 */
export async function bootstrapAppSettings(): Promise<void> {
  try {
    const remote = await settingsApi.getPublic();
    setAppSettings(resolveAppSettings(remote));
    clearRetry();
  } catch {
    setAppSettings(resolveAppSettings(null));
    scheduleRetry();
  }
}

/** Fetch from API and apply. Throws on failure (caller may schedule retry). */
export async function refreshAppSettings(): Promise<void> {
  const remote = await settingsApi.getPublic();
  setAppSettings(resolveAppSettings(remote));
  clearRetry();
}
