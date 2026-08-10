import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestWithUser } from './auth.guard';

/** Requires `AuthGuard` first — checks `is_super_admin` on the request user. */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!request.authorizedUserDetail) {
      throw new UnauthorizedException('Authorization required');
    }
    if (!request.authorizedUserDetail.is_super_admin) {
      throw new ForbiddenException('Super admin access required');
    }
    return true;
  }
}
