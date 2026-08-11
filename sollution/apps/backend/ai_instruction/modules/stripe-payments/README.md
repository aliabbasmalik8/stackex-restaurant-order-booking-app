# Module: `stripe-payments`

**Code:** [`src/modules/stripe-payments/`](../../../src/modules/stripe-payments/)

There is **no** generic `payment` Nest module — all card HTTP is Stripe-specific today. Shared order fields (`payment_method`, `payment_status`) live on the **order** module / entity. Add a generic `payment` module only when a second provider needs shared APIs.

HTTP + Nest wiring for **card checkout**: Stripe Customer ensure, PaymentIntents, webhook, and unpaid sync recovery.

## Routes

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/stripe-payments/intent` | JWT — ensures Stripe Customer, then intent |
| `POST` | `/api/stripe-payments/sync-payment-status` | JWT — **only if** `payment_status === unpaid`; asks Stripe |
| `POST` | `/api/stripe-payments/webhook` | Stripe signature |

## Status transitions

| Event | Order `status` | `payment_status` |
|-------|----------------|------------------|
| Stripe success (webhook **or** sync) | `draft` → `pending` | `paid` |
| Stripe fail (webhook **or** sync) | `draft` → `pending` | `failed` (admin may cancel) |

Kitchen should cook only cash or `payment_status === paid`.

### Stripe Customer

On `POST /intent`, before creating/reusing a PaymentIntent:

1. Load user
2. If `stripe_customer_id` exists and is valid in Stripe → reuse
3. Else create Customer + persist id
4. Attach `customer` on the PaymentIntent

Column: `user.stripe_customer_id` (not returned on `/users/me`).

## Files

| File | Role |
|------|------|
| `stripe-payments.module.ts` | Nest module |
| `stripe-payments.controller.ts` | Routes |
| `stripe-payments.service.ts` | Customer ensure + Intent + sync + webhook |
| `stripe-payments.dto.ts` | DTOs |
| `stripe.config.ts` | Env secret helpers + amount → minor units |

## Product features

| Feature | Doc |
|---------|-----|
| [Stripe](../../features/stripe/README.md) | Customers; PaymentIntents; webhook; sync when unpaid |

Setup: [features/stripe/setup.md](../../features/stripe/setup.md)

**Docs sync:** stripe-payments code changes ⇒ update this file + Stripe feature docs ([maintenance.md](../../maintenance.md)).
