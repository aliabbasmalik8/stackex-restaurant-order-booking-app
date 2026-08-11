export type PaymentIntentResponse = {
  clientSecret: string;
  paymentIntentId: string;
  currencyCode: string;
  currencyDisplay: string;
  businessName: string;
};

export type OrderPaymentStatusResponse = {
  orderId: string;
  paymentMethod: 'cash' | 'card';
  paymentStatus: 'not_required' | 'unpaid' | 'paid' | 'failed' | 'cancelled';
  orderStatus: string;
  paidAt: string | null;
  stripePaymentIntentId: string | null;
};
