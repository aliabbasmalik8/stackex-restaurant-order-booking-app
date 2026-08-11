import type { PaymentIntentResponse } from '@/api/OrderBooking/modules/stripe-payments';


/** Result of a platform confirm step (PaymentSheet / Elements). */
export type CardPaymentConfirmResult =
  | { status: 'succeeded' }
  | { status: 'canceled' }
  | { status: 'failed'; message: string };

/**
 * Platform driver — inject mocks in unit tests.
 * Must not be implemented in shared UI; use `.native` / `.web` modules.
 */
export type CardPaymentDriver = {
  prepare: (intent: PaymentIntentResponse) => Promise<void>;
  confirm: () => Promise<CardPaymentConfirmResult>;
};

export type CardPaymentMeta = {
  businessName: string;
  currencyDisplay: string;
};

export type CardPaymentSession = {
  loading: boolean;
  ready: boolean;
  paying: boolean;
  errorMessage: string | null;
  meta: CardPaymentMeta | null;
  /** Web Payment Element needs this; native sheet ignores it. */
  clientSecret: string | null;
  prepare: () => Promise<void>;
  pay: () => Promise<'paid' | 'canceled' | 'failed'>;
  clearError: () => void;
};

/** Handles filled by web Payment Element binder (for confirm). */
export type WebStripeHandles = {
  getStripe: () => unknown;
  getElements: () => unknown;
};
