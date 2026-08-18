import { stripePaymentsApi } from '@/api/OrderBooking/modules/stripe-payments'
import type {
  OrderPaymentStatusResponse,
  PaymentIntentResponse,
} from '@/api/OrderBooking/modules/stripe-payments'

export async function createPaymentIntent(
  orderId: string,
): Promise<PaymentIntentResponse> {
  return stripePaymentsApi.createIntent(orderId)
}

export async function syncOrderPaymentStatus(
  orderId: string,
): Promise<OrderPaymentStatusResponse> {
  return stripePaymentsApi.syncPaymentStatus(orderId)
}
