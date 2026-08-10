const AUTH_TOKEN_KEY = 'admin_auth_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';

const sessionClearedListeners = new Set<() => void>();

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;
let hydrated = false;

export function hydrateAuthSession(): void {
  if (hydrated || typeof window === 'undefined') return;
  memoryAccessToken = window.localStorage.getItem(AUTH_TOKEN_KEY);
  memoryRefreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
  hydrated = true;
}

export function getAccessToken(): string | null {
  if (!hydrated) hydrateAuthSession();
  return memoryAccessToken;
}

export function getRefreshToken(): string | null {
  if (!hydrated) hydrateAuthSession();
  return memoryRefreshToken;
}

export function setAuthSession(params: {
  token: string;
  refreshToken: string;
}): void {
  memoryAccessToken = params.token;
  memoryRefreshToken = params.refreshToken;
  hydrated = true;
  window.localStorage.setItem(AUTH_TOKEN_KEY, params.token);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, params.refreshToken);
}

export function clearAuthSession(): void {
  memoryAccessToken = null;
  memoryRefreshToken = null;
  hydrated = true;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
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
  return Boolean(getAccessToken());
}
