import { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
import { getStripePublishableKey } from '@/modules/payments/config';
import { useCardPaymentSession } from './useCardPaymentSession';
import { useWebElementsDriver } from './useWebElementsDriver';
import type { CardPaymentSession } from './types';
import { colors, radii } from '@/theme';

const stripePromise = loadStripe(getStripePublishableKey());

export type PlatformCardPayment = CardPaymentSession & {
  Form: React.ComponentType;
};

type BinderProps = {
  stripeRef: React.MutableRefObject<Stripe | null>;
  elementsRef: React.MutableRefObject<StripeElements | null>;
};

function WebElementsBinder({ stripeRef, elementsRef }: BinderProps) {
  const stripe = useStripe();
  const elements = useElements();
  stripeRef.current = stripe;
  elementsRef.current = elements;

  return (
    <View style={styles.form}>
      <PaymentElement options={{ layout: 'tabs' }} />
    </View>
  );
}

/**
 * Web card payment (Payment Element). Form mounts after clientSecret is ready.
 */
export function usePlatformCardPayment(orderId: string): PlatformCardPayment {
  const { t } = useTranslation();
  const stripeRef = useRef<Stripe | null>(null);
  const elementsRef = useRef<StripeElements | null>(null);

  const handles = useMemo(
    () => ({
      getStripe: () => stripeRef.current,
      getElements: () => elementsRef.current,
    }),
    [],
  );

  const driver = useWebElementsDriver(handles);
  const session = useCardPaymentSession({ orderId, driver, t });
  const clientSecret = session.clientSecret;

  const Form = useMemo(() => {
    function WebCardPaymentForm() {
      if (!clientSecret) return null;
      return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <WebElementsBinder
            stripeRef={stripeRef}
            elementsRef={elementsRef}
          />
        </Elements>
      );
    }
    return WebCardPaymentForm;
  }, [clientSecret]);

  return { ...session, Form };
}

const styles = StyleSheet.create({
  form: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14,
    minHeight: 180,
  },
});
