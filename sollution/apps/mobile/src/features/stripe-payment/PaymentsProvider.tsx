import type { ReactNode } from 'react';
import { isFeatureEnabled } from '@/features/_registry';
import { StripeAppProvider } from './StripeAppProvider';

/**
 * Wraps the app with Stripe when `stripePayment` is enabled.
 * Cash checkout does not depend on this provider.
 */
export function PaymentsProvider({ children }: { children: ReactNode }) {
  if (!isFeatureEnabled('stripePayment')) {
    return <>{children}</>;
  }
  return <StripeAppProvider>{children}</StripeAppProvider>;
}
