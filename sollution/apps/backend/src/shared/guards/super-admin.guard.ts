import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { OrderBookingException } from '@utils/order-booking.exception';
import { RequestWithUser } from './auth.guard';

/** Requires `AuthGuard` first — checks `is_super_admin` on the request user. */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!request.authorizedUserDetail) {
      throw new OrderBookingException({
        error_detail: 'SuperAdminGuard: Authorization required',
        user_error_detail: {
          english: 'Please sign in to continue.',
          arabic: 'يرجى تسجيل الدخول للمتابعة.',
        },
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }
    if (!request.authorizedUserDetail.is_super_admin) {
      throw new OrderBookingException({
        error_detail: `SuperAdminGuard: user ${request.authorizedUserDetail.userId} is not super admin`,
        user_error_detail: {
          english: 'You do not have permission to do this.',
          arabic: 'ليس لديك صلاحية للقيام بذلك.',
        },
        statusCode: HttpStatus.FORBIDDEN,
      });
    }
    return true;
  }
}
