import { orderBookingApiClient } from '@/api/OrderBooking/client'
import type {
  OrderPaymentStatusResponse,
  PaymentIntentResponse,
} from './stripe-payments.types'

export const stripePaymentsApi = {
  createIntent: (orderId: string): Promise<PaymentIntentResponse> =>
    orderBookingApiClient.post<PaymentIntentResponse>(
      '/stripe-payments/intent',
      { orderId },
    ),

  syncPaymentStatus: (orderId: string): Promise<OrderPaymentStatusResponse> =>
    orderBookingApiClient.post<OrderPaymentStatusResponse>(
      '/stripe-payments/sync-payment-status',
      { orderId },
    ),
}
