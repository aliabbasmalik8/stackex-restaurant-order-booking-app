import {
  errorMessageKey,
  getErrorMessage,
  toAppError,
} from '@/lib/errors';

type Translate = (key: string, opts?: Record<string, unknown>) => string;

/**
 * Prefer backend `user_error_detail` (localized), else API / Stripe / i18n fallback.
 */
export function getPaymentErrorDetail(
  error: unknown,
  t: Translate,
): string {
  const fallback = t(errorMessageKey(toAppError(error).code));
  return getErrorMessage(error, fallback);
}

/** Label the step that failed, then append the real detail. */
export function getPaymentErrorMessage(
  actionKey:
    | 'payment.createIntentFailed'
    | 'payment.prepareFailed'
    | 'payment.confirmFailed'
    | 'payment.syncFailed',
  error: unknown,
  t: Translate,
): string {
  return t(actionKey, { detail: getPaymentErrorDetail(error, t) });
}
