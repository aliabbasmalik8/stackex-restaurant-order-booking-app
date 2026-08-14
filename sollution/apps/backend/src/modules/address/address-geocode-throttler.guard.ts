import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import { RequestWithUser } from '@shared/guards/auth.guard';
import { OrderBookingException } from '@utils/order-booking.exception';

/** Rate-limit reverse geocode by signed-in user (IP fallback). */
@Injectable()
export class AddressGeocodeThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: RequestWithUser): Promise<string> {
    return req.authorizedUserDetail?.userId ?? req.ip ?? 'anonymous';
  }

  protected async throwThrottlingException(
    _context: ExecutionContext,
    _throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    throw new OrderBookingException({
      error_detail: 'Address reverse-geocode throttled',
      user_error_detail: {
        english: 'Too many location lookups. Please wait a moment.',
        arabic: 'محاولات كثيرة لتحديد الموقع. يرجى الانتظار قليلاً.',
      },
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
    });
  }
}
