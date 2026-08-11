import { paymentsApi } from '@/api/OrderBooking/modules/payments';
import type {
  OrderPaymentStatusResponse,
  PaymentIntentResponse,
} from '@/api/OrderBooking/modules/payments';

/** Throws `ApiError` with the backend message — do not swallow into generic AppError. */
export async function createPaymentIntent(
  orderId: string,
): Promise<PaymentIntentResponse> {
  return paymentsApi.createIntent(orderId);
}

export async function syncOrderPaymentStatus(
  orderId: string,
): Promise<OrderPaymentStatusResponse> {
  return paymentsApi.syncPaymentStatus(orderId);
}
