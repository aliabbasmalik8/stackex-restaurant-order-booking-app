import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@utils/config/app.config.type';
import { RedisService } from '../../redis.service';
import { IStoredRefreshTokenData, IStoredTokenData } from '@utils/global.type';
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from '@utils/constant';

@Injectable()
export class AuthRedisService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  async getStoredTokenData(
    sessionId: string,
    token: string,
    userId: string,
  ): Promise<IStoredTokenData | null> {
    const data = await this.redisService.get(
      this.getSessionKey({ sessionId, userId }),
    );
    if (!data) {
      return null;
    }
    try {
      const storedData = JSON.parse(data) as IStoredTokenData;
      if (storedData.token !== token) {
        return null;
      }
      return storedData;
    } catch {
      return null;
    }
  }

  async revokeToken(params: { sessionId: string; userId: string }): Promise<void> {
    await Promise.all([
      this.redisService.del(this.getSessionKey(params)),
      this.redisService.del(this.getRefreshSessionKey(params)),
    ]);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    const [accessKeys, refreshKeys] = await Promise.all([
      this.redisService.scanKeys(`auth:session:*:user:${userId}`),
      this.redisService.scanKeys(`auth:refresh:*:user:${userId}`),
    ]);
    const allKeys = [...accessKeys, ...refreshKeys];
    if (allKeys.length === 0) {
      return;
    }
    await Promise.all(allKeys.map((key) => this.redisService.del(key)));
  }

  async storeToken(
    sessionId: string,
    token: string,
    payload: { userId: string; email: string; is_super_admin: boolean },
  ): Promise<void> {
    const ttl = this.getTokenExpiryInSeconds();
    const tokenData: IStoredTokenData = {
      token,
      userId: payload.userId,
      email: payload.email,
      sessionId,
      is_super_admin: payload.is_super_admin,
    };
    await this.redisService.set(
      this.getSessionKey({ sessionId, userId: payload.userId }),
      JSON.stringify(tokenData),
      ttl ?? undefined,
    );
  }

  async getStoredRefreshTokenData(
    sessionId: string,
    userId: string,
  ): Promise<IStoredRefreshTokenData | null> {
    const data = await this.redisService.get(
      this.getRefreshSessionKey({ sessionId, userId }),
    );
    if (!data) {
      return null;
    }
    try {
      return JSON.parse(data) as IStoredRefreshTokenData;
    } catch {
      return null;
    }
  }

  async storeRefreshToken(params: {
    sessionId: string;
    userId: string;
    tokenHash: string;
    maxRefreshExpiresAtMs: number;
    lastRefreshedAtMs: number;
  }): Promise<void> {
    const ttl = this.getRefreshTokenExpiryInSeconds();
    const tokenData: IStoredRefreshTokenData = {
      tokenHash: params.tokenHash,
      userId: params.userId,
      sessionId: params.sessionId,
      maxRefreshExpiresAtMs: params.maxRefreshExpiresAtMs,
      lastRefreshedAtMs: params.lastRefreshedAtMs,
    };

    await this.redisService.set(
      this.getRefreshSessionKey({
        sessionId: params.sessionId,
        userId: params.userId,
      }),
      JSON.stringify(tokenData),
      ttl ?? undefined,
    );
  }

  private getSessionKey(params: { sessionId: string; userId: string }): string {
    const { sessionId, userId } = params;
    return `auth:session:${sessionId}:user:${userId}`;
  }

  private getRefreshSessionKey(params: {
    sessionId: string;
    userId: string;
  }): string {
    const { sessionId, userId } = params;
    return `auth:refresh:${sessionId}:user:${userId}`;
  }

  private getTokenExpiryInSeconds(): number | null {
    return this.parseExpiryToSeconds(ACCESS_TOKEN_EXPIRY);
  }

  private getRefreshTokenExpiryInSeconds(): number | null {
    return this.parseExpiryToSeconds(REFRESH_TOKEN_EXPIRY);
  }

  private parseExpiryToSeconds(expiresIn: string): number | null {
    if (!expiresIn) {
      return null;
    }
    const numericValue = Number(expiresIn);
    if (!Number.isNaN(numericValue)) {
      return numericValue;
    }
    const match = expiresIn.match(/^(\d+)([smhd])$/i);
    if (!match) {
      return null;
    }
    const value = Number(match[1]);
    const unit = match[2]?.toLowerCase();
    const unitMap: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };
    const multiplier = unit ? unitMap[unit] : 1;
    return value * multiplier;
  }
}
