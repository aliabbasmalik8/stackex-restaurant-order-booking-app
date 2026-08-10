import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '@shared/services/auth.service';
import { IAuthenticationToken, IStoredTokenData } from '@utils/global.type';

export interface RequestWithUser extends Request {
  user?: IAuthenticationToken;
  authorizedUserDetail?: IStoredTokenData;
}

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

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

    if (!storedTokenData.is_super_admin) {
      throw new ForbiddenException('Super admin access required');
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
