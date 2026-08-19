import type { PaymentIntentResponse } from '@/api/OrderBooking/modules/stripe-payments'

export type CardPaymentConfirmResult =
  | { status: 'succeeded' }
  | { status: 'canceled' }
  | { status: 'failed'; message: string }

export type CardPaymentDriver = {
  prepare: (intent: PaymentIntentResponse) => Promise<void>
  confirm: () => Promise<CardPaymentConfirmResult>
}

export type CardPaymentMeta = {
  businessName: string
  currencyDisplay: string
}

export type CardPaymentSession = {
  loading: boolean
  ready: boolean
  paying: boolean
  errorMessage: string | null
  meta: CardPaymentMeta | null
  clientSecret: string | null
  prepare: () => Promise<void>
  pay: () => Promise<'paid' | 'canceled' | 'failed'>
  clearError: () => void
}

export type WebStripeHandles = {
  getStripe: () => unknown
  getElements: () => unknown
}
