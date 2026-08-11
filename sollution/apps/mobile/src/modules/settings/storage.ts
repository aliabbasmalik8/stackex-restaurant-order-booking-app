import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SETTINGS_CACHE_TTL_MS,
  type SettingValue,
} from './catalog';

export const SETTINGS_STORAGE_KEY = 'app_public_settings_v1';

export type SettingsCacheRecord = {
  fetchedAt: number;
  expiresAt: number;
  values: Record<string, SettingValue>;
};

export async function readSettingsCache(): Promise<SettingsCacheRecord | null> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SettingsCacheRecord;
    if (
      !parsed ||
      typeof parsed.fetchedAt !== 'number' ||
      typeof parsed.expiresAt !== 'number' ||
      !parsed.values ||
      typeof parsed.values !== 'object'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function writeSettingsCache(
  values: Record<string, SettingValue>,
  ttlMs: number = SETTINGS_CACHE_TTL_MS,
): Promise<SettingsCacheRecord> {
  const fetchedAt = Date.now();
  const record: SettingsCacheRecord = {
    fetchedAt,
    expiresAt: fetchedAt + ttlMs,
    values,
  };
  await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(record));
  return record;
}

export function isSettingsCacheFresh(
  record: SettingsCacheRecord | null,
  now = Date.now(),
): boolean {
  return Boolean(record && record.expiresAt > now);
}
