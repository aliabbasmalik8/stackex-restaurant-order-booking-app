import { errorMessageKey, getErrorMessage, toAppError } from '@/lib/errors'

type Translate = (key: string, opts?: Record<string, unknown>) => string

export function getPaymentErrorDetail(error: unknown, t: Translate): string {
  const fallback = t(errorMessageKey(toAppError(error).code))
  return getErrorMessage(error, fallback)
}

export function getPaymentErrorMessage(
  actionKey:
    | 'payment.createIntentFailed'
    | 'payment.prepareFailed'
    | 'payment.confirmFailed'
    | 'payment.syncFailed',
  error: unknown,
  t: Translate,
): string {
  return t(actionKey, { detail: getPaymentErrorDetail(error, t) })
}
