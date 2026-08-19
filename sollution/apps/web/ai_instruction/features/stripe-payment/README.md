# Stripe payment (web)

Gated by `stripePayment` in `src/features/_registry`. Cash is always available.

- Publishable key: `VITE_STRIPE_PUBLISHABLE_KEY` (never the secret)
- Screens must not read `import.meta.env.VITE_STRIPE_*` — use `hasStripePublishableKey` / the registry
- Checkout: `CheckoutPaymentSection` — card row hidden if env missing (`alternativeAvailable`)
- Pay: `POST /api/stripe-payments/intent` then Stripe Payment Element, then `POST /api/stripe-payments/sync-payment-status`
