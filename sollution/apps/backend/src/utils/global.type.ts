export interface IAuthenticationToken {
  email: string;
  userId: string;
  sessionId: string;
}

export interface IStoredTokenData {
  token: string;
  email: string;
  userId: string;
  sessionId: string;
  is_super_admin: boolean;
}

export interface IRefreshAuthenticationToken {
  userId: string;
  sessionId: string;
}

export interface IStoredRefreshTokenData {
  tokenHash: string;
  userId: string;
  sessionId: string;
  maxRefreshExpiresAtMs: number;
  lastRefreshedAtMs: number;
}
