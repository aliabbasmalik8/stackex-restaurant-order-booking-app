import { useCallback, useEffect, useState } from 'react';
import {
  createPaymentIntent,
  syncOrderPaymentStatus,
} from '@/features/stripe-payment/api';
import { getPaymentErrorMessage } from './getPaymentErrorMessage';
import type {
  CardPaymentDriver,
  CardPaymentMeta,
  CardPaymentSession,
} from './types';

type Translate = (key: string, opts?: Record<string, unknown>) => string;

type Options = {
  orderId: string;
  driver: CardPaymentDriver;
  t: Translate;
  /**
   * After Stripe confirms, sync backend payment_status.
   * Injected for tests (default: real API).
   */
  syncPaymentStatus?: typeof syncOrderPaymentStatus;
  createIntent?: typeof createPaymentIntent;
};

/**
 * Platform-agnostic card checkout session:
 * intent → driver.prepare → driver.confirm → sync.
 * Unit-test by injecting a mock `driver` (+ optional API fns).
 */
export function useCardPaymentSession({
  orderId,
  driver,
  t,
  syncPaymentStatus = syncOrderPaymentStatus,
  createIntent = createPaymentIntent,
}: Options): CardPaymentSession {
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [meta, setMeta] = useState<CardPaymentMeta | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const prepare = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    setReady(false);
    setClientSecret(null);
    try {
      let intent;
      try {
        intent = await createIntent(orderId);
      } catch (error) {
        setErrorMessage(
          getPaymentErrorMessage('payment.createIntentFailed', error, t),
        );
        return;
      }

      setMeta({
        businessName: intent.businessName,
        currencyDisplay: intent.currencyDisplay,
      });
      setClientSecret(intent.clientSecret);

      try {
        await driver.prepare(intent);
      } catch (error) {
        setErrorMessage(
          getPaymentErrorMessage('payment.prepareFailed', error, t),
        );
        return;
      }

      setReady(true);
    } finally {
      setLoading(false);
    }
  }, [createIntent, driver, orderId, t]);

  useEffect(() => {
    void prepare();
  }, [prepare]);

  const pay = useCallback(async (): Promise<'paid' | 'canceled' | 'failed'> => {
    if (!ready || paying) return 'failed';
    setPaying(true);
    setErrorMessage(null);
    try {
      const confirmed = await driver.confirm();
      if (confirmed.status === 'canceled') {
        return 'canceled';
      }
      if (confirmed.status === 'failed') {
        setErrorMessage(
          t('payment.confirmFailed', { detail: confirmed.message }),
        );
        return 'failed';
      }

      try {
        const synced = await syncPaymentStatus(orderId);
        if (synced.paymentStatus !== 'paid') {
          setErrorMessage(t('payment.notConfirmed'));
          return 'failed';
        }
        return 'paid';
      } catch (error) {
        setErrorMessage(
          getPaymentErrorMessage('payment.syncFailed', error, t),
        );
        return 'failed';
      }
    } catch (error) {
      setErrorMessage(
        getPaymentErrorMessage('payment.confirmFailed', error, t),
      );
      return 'failed';
    } finally {
      setPaying(false);
    }
  }, [driver, orderId, paying, ready, syncPaymentStatus, t]);

  return {
    loading,
    ready,
    paying,
    errorMessage,
    meta,
    clientSecret,
    prepare,
    pay,
    clearError: () => setErrorMessage(null),
  };
}
