# Module: `payment`

**Code:** [`src/modules/payment/`](../../../src/modules/payment/)

## What it’s for

HTTP + Nest wiring for **card checkout**: Stripe Customer ensure, PaymentIntents, webhook, and unpaid sync recovery.  
Cash checkout does **not** need this module’s env — only order create (`pending` + `not_required`).

## Routes

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/payments/intent` | JWT — ensures Stripe Customer, then intent |
| `POST` | `/api/payments/sync-payment-status` | JWT — **only if** `payment_status === unpaid`; asks Stripe |
| `POST` | `/api/payments/webhook` | Stripe signature |

## Card lifecycle (with `order`)

| Event | Order `status` | `payment_status` |
|-------|----------------|------------------|
| Create card order | `draft` | `unpaid` |
| Stripe success (webhook **or** sync) | `draft` → `pending` | `paid` |
| Stripe fail (webhook **or** sync) | `draft` → `pending` | `failed` (admin may cancel) |

Kitchen should cook only cash or `payment_status === paid`.  
`GET /api/orders` (user) excludes `draft`; `GET /api/orders/manage` (admin) includes drafts.

### Stripe Customer

On `POST /intent`, before creating/reusing a PaymentIntent:

1. Load user  
2. If `stripe_customer_id` exists and is valid in Stripe → reuse  
3. Else `customers.create` (email/name/phone + `metadata.userId`) → save on user  
4. Attach `customer` on the PaymentIntent  

Column: `user.stripe_customer_id` (not returned on `/users/me`).

## Files

| File | Role |
|------|------|
| `payment.module.ts` | Nest module |
| `payment.controller.ts` | Routes |
| `payment.service.ts` | Customer ensure + Intent + sync + webhook |
| `payment.dto.ts` | DTOs |
| `stripe.config.ts` | Env secret helpers + amount → minor units |

## Depends on

- `OrderDbService` / `UserDbService` / `SettingModule` (`SettingService`)
- `SharedModule` (JWT on intent / sync)

## Exports

None (HTTP-only today).

## Product features used

| Feature | How this module uses it |
|---------|-------------------------|
| [Stripe](../../features/stripe/README.md) | Customers; PaymentIntents; webhook; sync when unpaid |

Setup: [features/stripe/setup.md](../../features/stripe/setup.md)

**Docs sync:** payment code changes ⇒ update this file + Stripe feature docs ([maintenance.md](../../maintenance.md)).
