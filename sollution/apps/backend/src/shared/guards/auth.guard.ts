import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '@shared/services/auth.service';
import { UserDbService } from '@database/services/user-db.service';
import { IAuthUser, IAuthenticationToken } from '@utils/global.type';
import { OrderBookingException } from '@utils/order-booking.exception';

export interface RequestWithUser extends Request {
  user?: IAuthenticationToken;
  authorizedUserDetail?: IAuthUser;
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
      throw new OrderBookingException({
        error_detail: 'Authorization token missing',
        user_error_detail: {
          english: 'Please sign in to continue.',
          arabic: 'يرجى تسجيل الدخول للمتابعة.',
        },
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const payload = await this.authService.decodeToken(token);
    if (!payload?.userId) {
      throw new OrderBookingException({
        error_detail: 'Invalid or expired token',
        user_error_detail: {
          english: 'Your session has expired. Please sign in again.',
          arabic: 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.',
        },
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const user = await this.userDbService.findById(payload.userId);
    if (!user || !user.is_active) {
      throw new OrderBookingException({
        error_detail: `AuthGuard: user ${payload.userId} missing or inactive`,
        user_error_detail: {
          english: 'This account has been disabled.',
          arabic: 'تم تعطيل هذا الحساب.',
        },
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const authUser: IAuthUser = {
      token,
      email: user.email ?? payload.email,
      userId: user.id,
      is_super_admin: Boolean(user.is_super_admin),
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
