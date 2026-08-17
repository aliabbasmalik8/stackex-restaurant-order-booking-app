export const AUTH_TOKEN_STORAGE_KEY = 'auth_token'
export const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token'

const sessionClearedListeners = new Set<() => void>()

let memoryAccessToken: string | null = null
let memoryRefreshToken: string | null = null
let hydrated = false

function readStoredSession(): [string | null, string | null] {
  try {
    return [
      localStorage.getItem(AUTH_TOKEN_STORAGE_KEY),
      localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY),
    ]
  } catch {
    return [null, null]
  }
}

export async function hydrateAuthSession(): Promise<void> {
  if (hydrated) return
  const [token, refreshToken] = readStoredSession()
  memoryAccessToken = token
  memoryRefreshToken = refreshToken
  hydrated = true
}

export function getAccessToken(): string | null {
  return memoryAccessToken
}

export function getRefreshToken(): string | null {
  return memoryRefreshToken
}

export async function setAuthSession(params: {
  token: string
  refreshToken: string
}): Promise<void> {
  memoryAccessToken = params.token
  memoryRefreshToken = params.refreshToken
  hydrated = true
  try {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, params.token)
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, params.refreshToken)
  } catch {
    // Session still lives in memory for this launch.
  }
}

export async function clearAuthSession(): Promise<void> {
  memoryAccessToken = null
  memoryRefreshToken = null
  hydrated = true
  try {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  } catch {
    // Memory session is already cleared.
  }
  for (const listener of sessionClearedListeners) {
    listener()
  }
}

export function onAuthSessionCleared(listener: () => void): () => void {
  sessionClearedListeners.add(listener)
  return () => {
    sessionClearedListeners.delete(listener)
  }
}

export function hasAuthSession(): boolean {
  return Boolean(memoryAccessToken)
}
