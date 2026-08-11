import { ApiError } from '@/api/OrderBooking/client';
import { AppError, errorMessageKey, toAppError } from '@/lib/errors';

type Translate = (key: string, opts?: Record<string, unknown>) => string;

/**
 * Prefer the real API / Stripe message over generic `errors.*` copy.
 */
export function getPaymentErrorDetail(
  error: unknown,
  t: Translate,
): string {
  if (error instanceof ApiError) {
    const msg = error.message?.trim();
    if (msg) return msg;
  }

  if (error instanceof AppError) {
    return t(errorMessageKey(error.code));
  }

  if (error instanceof Error) {
    const msg = error.message?.trim();
    if (msg && msg !== 'unknown') return msg;
  }

  return t(errorMessageKey(toAppError(error).code));
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
