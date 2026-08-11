import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { AuthGuard } from '@shared/guards/auth.guard';
import { IAuthUser } from '@utils/global.type';
import type { Request } from 'express';
import {
  CreatePaymentIntentDto,
  OrderPaymentStatusResponseDto,
  PaymentIntentResponseDto,
  SyncPaymentStatusDto,
} from './payment.dto';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /** Create / reuse a PaymentIntent for an unpaid card order. */
  @Post('intent')
  @UseGuards(AuthGuard)
  async createIntent(
    @CurrentUser() user: IAuthUser,
    @Body() dto: CreatePaymentIntentDto,
  ): Promise<PaymentIntentResponseDto> {
    return this.paymentService.createIntent(user.userId, dto.orderId);
  }

  /**
   * Webhook recovery when payment_status is still unpaid.
   * Verifies with Stripe; applies paid/failed + draft→pending.
   */
  @Post('sync-payment-status')
  @UseGuards(AuthGuard)
  async syncPaymentStatus(
    @CurrentUser() user: IAuthUser,
    @Body() dto: SyncPaymentStatusDto,
  ): Promise<OrderPaymentStatusResponseDto> {
    return this.paymentService.syncPaymentStatus(user.userId, dto.orderId);
  }

  /**
   * Stripe → Nest webhook. Requires `rawBody: true` in NestFactory
   * so signature verification works.
   */
  @Post('webhook')
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ): Promise<{ received: true }> {
    const raw = req.rawBody;
    if (!raw) {
      throw new BadRequestException(
        'Missing raw body for Stripe webhook. Ensure NestFactory.create(..., { rawBody: true }).',
      );
    }
    await this.paymentService.handleWebhook(raw, signature);
    return { received: true };
  }
}
