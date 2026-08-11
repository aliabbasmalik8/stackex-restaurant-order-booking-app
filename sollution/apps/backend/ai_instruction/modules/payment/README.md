# Module: `payment`

**Code:** [`src/modules/payment/`](../../../src/modules/payment/)

## What it’s for

HTTP + Nest wiring for **card checkout**: PaymentIntents, webhook, and unpaid sync recovery.  
Cash checkout does **not** need this module’s env — only order create (`pending` + `not_required`).

## Routes

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/payments/intent` | JWT |
| `POST` | `/api/payments/sync-payment-status` | JWT — **only if** `payment_status === unpaid`; asks Stripe |
| `POST` | `/api/payments/webhook` | Stripe signature |

## Card lifecycle (with `order`)

| Event | Order `status` | `payment_status` |
|-------|----------------|------------------|
| Create card order | `draft` | `unpaid` |
| Stripe success (webhook **or** sync) | `draft` → `pending` | `paid` |
| Stripe fail (webhook **or** sync) | `draft` → `pending` | `failed` (admin may cancel) |

Kitchen should cook only cash or `payment_status === paid`.  
`GET /api/orders/manage` excludes `draft` rows.

## Files

| File | Role |
|------|------|
| `payment.module.ts` | Nest module |
| `payment.controller.ts` | Routes |
| `payment.service.ts` | Intent + sync + webhook |
| `payment.dto.ts` | DTOs |
| `stripe.config.ts` | Env secret helpers + amount → minor units |

## Depends on

- `OrderDbService` / `SettingModule` (`SettingService`)
- `SharedModule` (JWT on intent / sync)

## Exports

None (HTTP-only today).

## Product features used

| Feature | How this module uses it |
|---------|-------------------------|
| [Stripe](../../features/stripe/README.md) | PaymentIntents; webhook; sync when unpaid |

Setup: [features/stripe/setup.md](../../features/stripe/setup.md)

**Docs sync:** payment code changes ⇒ update this file + Stripe feature docs ([maintenance.md](../../maintenance.md)).
