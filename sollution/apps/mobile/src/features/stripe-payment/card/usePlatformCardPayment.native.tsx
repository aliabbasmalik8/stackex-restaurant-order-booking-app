import { useTranslation } from 'react-i18next';
import { useCardPaymentSession } from './useCardPaymentSession';
import { useNativePaymentSheetDriver } from './useNativePaymentSheetDriver';
import type { CardPaymentSession } from './types';

export type PlatformCardPayment = CardPaymentSession & {
  /** Native sheet — no inline form. */
  Form: null;
};

/**
 * iOS / Android card payment (PaymentSheet).
 */
export function usePlatformCardPayment(orderId: string): PlatformCardPayment {
  const { t } = useTranslation();
  const driver = useNativePaymentSheetDriver();
  const session = useCardPaymentSession({ orderId, driver, t });
  return { ...session, Form: null };
}
