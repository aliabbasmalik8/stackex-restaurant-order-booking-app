# Feature: `paymentMethods`

- **Priority `mode`:** `enabled` (when env OK)
- **Required env:** `EXPO_PUBLIC_SERVICE_PAYMENT_METHODS`
- **Alternative:** yes (cash) → missing env ⇒ **hidden**
- Gate checkout/profile with `isServiceInteractive('paymentMethods')`
- When hidden/off: cash checkout still works
- Stripe secrets never in `EXPO_PUBLIC_*` — backend owns secrets

Backend: [`../../../../backend/ai_instruction/features/stripe/`](../../../../backend/ai_instruction/features/stripe/)
