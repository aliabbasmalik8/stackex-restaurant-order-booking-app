# Feature: `stripePayment`

- **Mode:** `enabled` when publishable key present
- **Required env:** `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Alt → hide if missing:** yes (cash always available)
- **Gate:** `isFeatureInteractive('stripePayment')` / `shouldRenderFeature('stripePayment')`
- **Code:** `src/features/stripe-payment/`
- **UI:** `src/feature-ui/stripe-payment/CheckoutPaymentSection`, `PaymentScreen`
- **HTTP:** `src/api/OrderBooking/modules/stripe-payments/`
- **Provider:** `PaymentsProvider` in `AppProvider` (wraps Stripe when enabled)

## API routes (Nest `StripePaymentsModule`)

| Method | Path |
|--------|------|
| `POST` | `/api/stripe-payments/intent` |
| `POST` | `/api/stripe-payments/sync-payment-status` |
| `POST` | `/api/stripe-payments/webhook` (Stripe → Nest) |

Card flow: checkout → place order (draft on `pendingPaymentOrder`) → `/payment?orderId=` → intent → confirm → sync → success.  
Cash is **not** this feature — always on, not in the registry.

Payment UI errors use `getPaymentErrorMessage` → `getErrorMessage` (backend `user_error_detail`). See [error-handling.md](../../error-handling.md).

Modular card stack: [card README](../../../../src/features/stripe-payment/card/README.md)
