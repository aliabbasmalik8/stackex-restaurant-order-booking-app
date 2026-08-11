import { useMemo } from 'react';
import { useStripe } from '@stripe/stripe-react-native';
import type { PaymentIntentResponse } from '@/api/OrderBooking/modules/payments';
import type {
  CardPaymentConfirmResult,
  CardPaymentDriver,
} from './types';

/**
 * Native PaymentSheet driver. Isolated for tests / swapping.
 */
export function useNativePaymentSheetDriver(): CardPaymentDriver {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  return useMemo<CardPaymentDriver>(
    () => ({
      prepare: async (intent: PaymentIntentResponse) => {
        const { error } = await initPaymentSheet({
          merchantDisplayName: intent.businessName || 'Order',
          paymentIntentClientSecret: intent.clientSecret,
          allowsDelayedPaymentMethods: false,
          returnURL: 'order-booking://payment-return',
        });
        if (error) {
          throw new Error(error.message);
        }
      },
      confirm: async (): Promise<CardPaymentConfirmResult> => {
        const { error } = await presentPaymentSheet();
        if (!error) return { status: 'succeeded' };
        if (error.code === 'Canceled') return { status: 'canceled' };
        return { status: 'failed', message: error.message };
      },
    }),
    [initPaymentSheet, presentPaymentSheet],
  );
}
