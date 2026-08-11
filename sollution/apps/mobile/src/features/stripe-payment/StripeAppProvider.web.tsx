import type { ReactNode } from 'react';

/**
 * Web: Elements are scoped to the payment form (clientSecret),
 * so no root StripeProvider is required.
 */
export function StripeAppProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
