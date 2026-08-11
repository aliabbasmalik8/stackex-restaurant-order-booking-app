# Feature: `paymentMethods`

Default: **disabled**. Card / payment method UI and Stripe client flows.

- Env: `EXPO_PUBLIC_SERVICE_PAYMENT_METHODS=1`
- Registry: `paymentMethods`
- Gate checkout / profile payment entry with `isServiceInteractive('paymentMethods')`
- When off: cash / non-card checkout must still work
- When on: align with backend Stripe (`POST /payments/intent`, `sync-payment-status`); never put Stripe **secret** keys in Expo public env — publishable key only if needed

Backend: [`../../../../backend/ai_instruction/features/stripe/`](../../../../backend/ai_instruction/features/stripe/)
