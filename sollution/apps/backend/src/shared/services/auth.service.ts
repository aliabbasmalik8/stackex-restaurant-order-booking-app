import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import {
  IAuthenticationToken,
  IRefreshAuthenticationToken,
  IStoredRefreshTokenData,
  IStoredTokenData,
} from '@utils/global.type';
import { hash, compare } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@utils/config/app.config.type';
import { randomUUID } from 'crypto';
import { AuthRedisService } from './redis/services/auth/auth-redis.service';
import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_SESSION_IDLE_TIMEOUT,
  REFRESH_SESSION_MAX_AGE,
  REFRESH_TOKEN_EXPIRY,
} from '@utils/constant';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig>,
    private readonly authRedisService: AuthRedisService,
  ) {}

  async generateAuthTokens(
    userId: string,
    email: string,
    isSuperAdmin: boolean,
    sessionId?: string,
    maxRefreshExpiresAtMs?: number,
    lastRefreshedAtMs?: number,
  ): Promise<{ token: string; refreshToken: string; sessionId: string }> {
    const resolvedSessionId = sessionId ?? randomUUID();
    const expiresIn = ACCESS_TOKEN_EXPIRY;
    const secret = this.configService.get<string>('JWT_SECRET') ?? '';
    const refreshExpiry = REFRESH_TOKEN_EXPIRY;
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      this.configService.get<string>('JWT_SECRET') ??
      '';
    const resolvedMaxRefreshExpiresAtMs =
      maxRefreshExpiresAtMs ??
      Date.now() + this.parseDurationToMs(REFRESH_SESSION_MAX_AGE);
    const resolvedLastRefreshedAtMs = lastRefreshedAtMs ?? Date.now();

    const token = await this.jwtService.signAsync(
      {
        userId,
        email,
        sessionId: resolvedSessionId,
      },
      {
        expiresIn: String(expiresIn) as JwtSignOptions['expiresIn'],
        secret,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        userId,
        sessionId: resolvedSessionId,
      },
      {
        expiresIn: String(refreshExpiry) as JwtSignOptions['expiresIn'],
        secret: refreshSecret,
      },
    );

    await this.authRedisService.storeToken(resolvedSessionId, token, {
      userId,
      email,
      is_super_admin: isSuperAdmin,
    });
    await this.authRedisService.storeRefreshToken({
      sessionId: resolvedSessionId,
      userId,
      tokenHash: await this.createHash(refreshToken),
      maxRefreshExpiresAtMs: resolvedMaxRefreshExpiresAtMs,
      lastRefreshedAtMs: resolvedLastRefreshedAtMs,
    });

    return {
      token,
      refreshToken,
      sessionId: resolvedSessionId,
    };
  }

  async decodeToken(token: string): Promise<null | IAuthenticationToken> {
    try {
      return await this.jwtService.verifyAsync<IAuthenticationToken>(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch {
      return null;
    }
  }

  async createHash(value: string): Promise<string> {
    const saltRounds = 10;
    return hash(value, saltRounds);
  }

  async matchHash(hashValue: string, value: string): Promise<boolean> {
    return compare(value, hashValue);
  }

  async getStoredTokenData(
    sessionId: string,
    token: string,
    userId: string,
  ): Promise<IStoredTokenData | null> {
    return this.authRedisService.getStoredTokenData(sessionId, token, userId);
  }

  async revokeToken({
    sessionId,
    userId,
  }: {
    sessionId: string;
    userId: string;
  }): Promise<void> {
    await this.authRedisService.revokeToken({ sessionId, userId });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.authRedisService.revokeAllUserSessions(userId);
  }

  async decodeRefreshToken(
    token: string,
  ): Promise<null | IRefreshAuthenticationToken> {
    try {
      return await this.jwtService.verifyAsync<IRefreshAuthenticationToken>(
        token,
        {
          secret:
            this.configService.get('JWT_REFRESH_SECRET') ??
            this.configService.get('JWT_SECRET'),
        },
      );
    } catch {
      return null;
    }
  }

  async getStoredRefreshTokenData(
    sessionId: string,
    userId: string,
  ): Promise<IStoredRefreshTokenData | null> {
    return this.authRedisService.getStoredRefreshTokenData(sessionId, userId);
  }

  isRefreshSessionExpired(maxRefreshExpiresAtMs: number): boolean {
    return Date.now() >= maxRefreshExpiresAtMs;
  }

  isRefreshSessionStale(lastRefreshedAtMs: number): boolean {
    const idleTimeoutMs = this.parseDurationToMs(REFRESH_SESSION_IDLE_TIMEOUT);
    return Date.now() - lastRefreshedAtMs >= idleTimeoutMs;
  }

  private parseDurationToMs(durationValue: string): number {
    const numericValue = Number(durationValue);
    if (!Number.isNaN(numericValue)) {
      return numericValue * 1000;
    }
    const match = durationValue.match(/^(\d+)([smhd])$/i);
    if (!match) {
      return 0;
    }
    const value = Number(match[1]);
    const unit = match[2]?.toLowerCase();
    const unitMap: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * (unit ? (unitMap[unit] ?? 0) : 0);
  }
}
