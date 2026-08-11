import { useMemo, useRef } from 'react';
import type { Stripe, StripeElements } from '@stripe/stripe-js';
import type { PaymentIntentResponse } from '@/api/OrderBooking/modules/stripe-payments';

import type {
  CardPaymentConfirmResult,
  CardPaymentDriver,
  WebStripeHandles,
} from './types';

/**
 * Web Elements driver. Confirm uses handles filled by the Payment Element binder.
 * Unit-test by mocking `handles`.
 */
export function useWebElementsDriver(
  handles: WebStripeHandles,
): CardPaymentDriver {
  const handlesRef = useRef(handles);
  handlesRef.current = handles;

  return useMemo<CardPaymentDriver>(
    () => ({
      prepare: async (_intent: PaymentIntentResponse) => {
        // clientSecret is applied via Elements options in the form binder
      },
      confirm: async (): Promise<CardPaymentConfirmResult> => {
        const stripe = handlesRef.current.getStripe() as Stripe | null;
        const elements = handlesRef.current.getElements() as StripeElements | null;
        if (!stripe || !elements) {
          return {
            status: 'failed',
            message: 'Payment form is not ready yet.',
          };
        }

        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
        });

        if (error) {
          return {
            status: 'failed',
            message: error.message ?? 'Payment failed',
          };
        }

        if (
          paymentIntent &&
          (paymentIntent.status === 'succeeded' ||
            paymentIntent.status === 'processing')
        ) {
          return { status: 'succeeded' };
        }

        return {
          status: 'failed',
          message: `Unexpected payment status: ${paymentIntent?.status ?? 'unknown'}`,
        };
      },
    }),
    [],
  );
}
