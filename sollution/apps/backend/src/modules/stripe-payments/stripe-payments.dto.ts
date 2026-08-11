import { PaymentMethod, PaymentStatus } from '@database/entities/Order.model';
import { IsUUID } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsUUID()
  orderId!: string;
}

export class SyncPaymentStatusDto {
  @IsUUID()
  orderId!: string;
}

export class PaymentIntentResponseDto {
  clientSecret!: string;
  paymentIntentId!: string;
  /** From white-label settings (`currency_code`). */
  currencyCode!: string;
  /** From white-label settings (`currency_display`). */
  currencyDisplay!: string;
  /** From white-label settings (`business_name`). */
  businessName!: string;
}

export class OrderPaymentStatusResponseDto {
  orderId!: string;
  paymentMethod!: PaymentMethod;
  paymentStatus!: PaymentStatus;
  orderStatus!: string;
  paidAt!: string | null;
  stripePaymentIntentId!: string | null;
}
