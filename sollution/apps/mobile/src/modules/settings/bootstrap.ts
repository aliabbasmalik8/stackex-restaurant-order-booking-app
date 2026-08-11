import { settingsApi } from '@/api/OrderBooking/modules/settings';
import { resolveAppSettings } from './resolve';
import { setAppSettings } from './store';
import {
  isSettingsCacheFresh,
  readSettingsCache,
  writeSettingsCache,
} from './storage';

/**
 * App-load bootstrap:
 * 1. Read AsyncStorage cache
 * 2. If fresh → apply (merged with frontend catalog defaults)
 * 3. Else fetch `/settings/public`, persist with TTL, apply
 * 4. On fetch failure with stale/empty cache → catalog defaults
 */
export async function bootstrapAppSettings(): Promise<void> {
  const cached = await readSettingsCache();

  if (isSettingsCacheFresh(cached)) {
    setAppSettings(resolveAppSettings(cached!.values));
    return;
  }

  try {
    const remote = await settingsApi.getPublic();
    await writeSettingsCache(remote);
    setAppSettings(resolveAppSettings(remote));
  } catch {
    if (cached?.values) {
      setAppSettings(resolveAppSettings(cached.values));
      return;
    }
    setAppSettings(resolveAppSettings(null));
  }
}

/** Force refresh from API and rewrite cache (e.g. pull-to-refresh later). */
export async function refreshAppSettings(): Promise<void> {
  const remote = await settingsApi.getPublic();
  await writeSettingsCache(remote);
  setAppSettings(resolveAppSettings(remote));
}
