import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { IAuthenticationToken } from '@utils/global.type';
import { hash, compare } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@utils/config/app.config.type';
import { ACCESS_TOKEN_EXPIRY } from '@utils/constant';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  async generateAuthTokens(
    userId: string,
    email: string,
    isSuperAdmin: boolean,
  ): Promise<{ token: string; refreshToken: string }> {
    const secret = this.configService.get<string>('JWT_SECRET') ?? '';
    const token = await this.jwtService.signAsync(
      {
        userId,
        email,
        is_super_admin: isSuperAdmin,
      },
      {
        expiresIn: String(ACCESS_TOKEN_EXPIRY) as JwtSignOptions['expiresIn'],
        secret,
      },
    );

    // Same token returned for API compatibility with clients that store refreshToken.
    // No server-side session store — logout is client-side only.
    return {
      token,
      refreshToken: token,
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
}
