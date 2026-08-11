import type { ReactNode } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { getStripePublishableKey, hasStripePublishableKey } from './config';

/**
 * Native Stripe provider (PaymentSheet).
 * Web uses `StripeAppProvider.web.tsx` (passthrough — no native SDK).
 */
export function StripeAppProvider({ children }: { children: ReactNode }) {
  if (!hasStripePublishableKey()) {
    return <>{children}</>;
  }

  // Guard: metro may stub the SDK as empty on web if resolution goes wrong.
  if (typeof StripeProvider !== 'function') {
    return <>{children}</>;
  }

  return (
    <StripeProvider
      publishableKey={getStripePublishableKey()}
      urlScheme="order-booking"
      merchantIdentifier="merchant.com.orderbooking"
    >
      <>{children}</>
    </StripeProvider>
  );
}
