import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '@shared/services/auth.service';
import { UserDbService } from '@database/services/user-db.service';
import { IAuthenticationToken, IStoredTokenData } from '@utils/global.type';

export interface RequestWithUser extends Request {
  user?: IAuthenticationToken;
  authorizedUserDetail?: IStoredTokenData;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly userDbService: UserDbService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Authorization token missing');
    }

    const payload = await this.authService.decodeToken(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (!payload.sessionId) {
      throw new UnauthorizedException('Invalid token format');
    }

    const storedTokenData = await this.authService.getStoredTokenData(
      payload.sessionId,
      token,
      payload.userId,
    );
    if (!storedTokenData) {
      throw new UnauthorizedException('Token revoked or not registered');
    }

    const user = await this.userDbService.findById(payload.userId);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Account is disabled');
    }

    request.user = payload;
    request.authorizedUserDetail = storedTokenData;
    return true;
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return null;
    }
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      return null;
    }
    return token;
  }
}
