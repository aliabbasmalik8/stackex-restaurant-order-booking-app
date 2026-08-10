import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '@shared/services/auth.service';
import { UserDbService } from '@database/services/user-db.service';
import { IAuthUser, IAuthenticationToken } from '@utils/global.type';

export interface RequestWithUser extends Request {
  user?: IAuthenticationToken;
  authorizedUserDetail?: IAuthUser;
}

@Injectable()
export class SuperAdminGuard implements CanActivate {
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
    if (!payload?.userId) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.userDbService.findById(payload.userId);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Account is disabled');
    }

    if (!user.is_super_admin) {
      throw new ForbiddenException('Super admin access required');
    }

    const authUser: IAuthUser = {
      token,
      email: user.email ?? payload.email,
      userId: user.id,
      is_super_admin: true,
    };

    request.user = payload;
    request.authorizedUserDetail = authUser;
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
