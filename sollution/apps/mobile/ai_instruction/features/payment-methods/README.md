# Feature: `paymentMethods`

- **Priority `mode`:** `enabled` (when env OK)
- **Required env:** `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_…` only — never secret keys)
- **Alternative:** yes (cash) → missing key ⇒ **hidden**
- Gate checkout/profile with `isServiceInteractive('paymentMethods')`
- When hidden/off: cash checkout still works

## Checkout flow

```text
Checkout → select cash | card → Place order (POST /orders)
  cash → /order-success
  card → /payment → platform pay → sync → /order-success
```

| Platform | Pay UI |
|----------|--------|
| iOS / Android | Stripe PaymentSheet (`@stripe/stripe-react-native`) |
| Web | Stripe Payment Element (`@stripe/react-stripe-js`) |

| Step | API |
|------|-----|
| Place order | `POST /orders` with `paymentMethod: cash \| card` |
| Pay (card) | `POST /payments/intent` then platform confirm |
| Confirm | `POST /payments/sync-payment-status` (or webhook) |

**Modular code (test session with mock driver):**  
`src/modules/payments/card/` — see [card README](../../../../src/modules/payments/card/README.md)

Native: PaymentSheet · Web: Payment Element · Metro stubs `@stripe/stripe-react-native` on web.

Backend: [`../../../../backend/ai_instruction/features/stripe/`](../../../../backend/ai_instruction/features/stripe/)
