import { orderBookingApiClient } from '@/api/OrderBooking/client';
import type {
  OrderPaymentStatusResponse,
  PaymentIntentResponse,
} from './payments.types';

export const paymentsApi = {
  createIntent: (orderId: string): Promise<PaymentIntentResponse> =>
    orderBookingApiClient.post<PaymentIntentResponse>('/payments/intent', {
      orderId,
    }),

  syncPaymentStatus: (
    orderId: string,
  ): Promise<OrderPaymentStatusResponse> =>
    orderBookingApiClient.post<OrderPaymentStatusResponse>(
      '/payments/sync-payment-status',
      { orderId },
    ),
};
