import AsyncStorage from '@react-native-async-storage/async-storage';

/** Optional — not part of the Firebase six-key contract. See `.docs/preview-mode.md`. */
export const PREVIEW_MODE_ENV_KEY = 'EXPO_PUBLIC_PREVIEW_MODE';

const STORAGE_KEY = 'preview_welcome_shown';

/** Auto-dismiss duration for the preview welcome overlay. */
export const PREVIEW_WELCOME_MS = 10000;

export function isPreviewMode(): boolean {
  const raw = process.env[PREVIEW_MODE_ENV_KEY]?.trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

export async function hasShownPreviewWelcome(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    return value === '1';
  } catch {
    return false;
  }
}

export async function markPreviewWelcomeShown(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // ignore — worst case overlay may show again next launch
  }
}
