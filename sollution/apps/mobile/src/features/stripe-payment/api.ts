import { stripePaymentsApi } from '@/api/OrderBooking/modules/stripe-payments';
import type {
  OrderPaymentStatusResponse,
  PaymentIntentResponse,
} from '@/api/OrderBooking/modules/stripe-payments';

/** Throws `ApiError` with the backend message — do not swallow into generic AppError. */
export async function createPaymentIntent(
  orderId: string,
): Promise<PaymentIntentResponse> {
  return stripePaymentsApi.createIntent(orderId);
}

export async function syncOrderPaymentStatus(
  orderId: string,
): Promise<OrderPaymentStatusResponse> {
  return stripePaymentsApi.syncPaymentStatus(orderId);
}
