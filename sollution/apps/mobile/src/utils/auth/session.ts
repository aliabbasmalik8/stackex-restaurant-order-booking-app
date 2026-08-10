import AsyncStorage from '@react-native-async-storage/async-storage';

export const AUTH_TOKEN_STORAGE_KEY = 'auth_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';

const sessionClearedListeners = new Set<() => void>();

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;
let hydrated = false;

export async function hydrateAuthSession(): Promise<void> {
  if (hydrated) return;
  const [token, refreshToken] = await Promise.all([
    AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY),
    AsyncStorage.getItem(REFRESH_TOKEN_STORAGE_KEY),
  ]);
  memoryAccessToken = token;
  memoryRefreshToken = refreshToken;
  hydrated = true;
}

export function getAccessToken(): string | null {
  return memoryAccessToken;
}

export function getRefreshToken(): string | null {
  return memoryRefreshToken;
}

export async function setAuthSession(params: {
  token: string;
  refreshToken: string;
}): Promise<void> {
  memoryAccessToken = params.token;
  memoryRefreshToken = params.refreshToken;
  hydrated = true;
  await Promise.all([
    AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, params.token),
    AsyncStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, params.refreshToken),
  ]);
}

export async function clearAuthSession(): Promise<void> {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  hydrated = true;
  await Promise.all([
    AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY),
    AsyncStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY),
  ]);
  for (const listener of sessionClearedListeners) {
    listener();
  }
}

export function onAuthSessionCleared(listener: () => void): () => void {
  sessionClearedListeners.add(listener);
  return () => {
    sessionClearedListeners.delete(listener);
  };
}

export function hasAuthSession(): boolean {
  return Boolean(memoryAccessToken);
}
