# Feature: Stripe

Card payments for white-label pickup orders using Stripe PaymentIntents.

Optional: without Stripe env keys the API stays **cash-only**; the Nest `payment` module returns `503` on intent.

**Docs sync:** if Stripe behavior, env, webhook events, or consuming modules change → update this file, [setup.md](./setup.md), and the module docs linked below ([maintenance.md](../../maintenance.md)).

## Setup

→ **[setup.md](./setup.md)** (Dashboard keys, webhook, CLI, settings keys, order columns)

## Modules that use this feature

| Nest module | Doc | Uses Stripe for |
|-------------|-----|-----------------|
| `payment` | [modules/payment](../../modules/payment/README.md) | Customer ensure; Intent; webhook; sync when unpaid |
| `order` | [modules/order](../../modules/order/README.md) | Card → `draft`+`unpaid`; cash → `pending`; paid/failed → `pending` |
| `setting` | [modules/setting](../../modules/setting/README.md) | Supply `currency_code`, `currency_display`, `business_name`, `business_monogram` to intents |
| `user` | [modules/user](../../modules/user/README.md) | Persists `stripe_customer_id` (lazy on first card intent) |

## Flow (summary)

1. Client: `POST /api/orders` with `paymentMethod: "card"` → `draft` + `unpaid`  
2. Client: `POST /api/payments/intent`  
   - Ensure Stripe **Customer** (reuse `user.stripe_customer_id` or create + save)  
   - Create/reuse PaymentIntent **attached to that customer**  
3. Client confirms with Stripe SDK  
4. Stripe webhook **or** `POST /api/payments/sync-payment-status` (unpaid only) → `paid`/`failed` + `draft` → `pending`  
5. Abandoned checkout stays `draft` (hidden from user list; visible on admin manage)

## Related

- [../README.md](../README.md) — features index  
- [../../modules/README.md](../../modules/README.md) — Nest modules  
- [../../maintenance.md](../../maintenance.md) — docs must stay in sync  
