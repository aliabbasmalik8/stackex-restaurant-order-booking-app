# Module: `order`

**Code:** [`src/modules/order/`](../../../src/modules/order/)

## What it’s for

Pickup orders: user create/list; admin manage + kitchen status.

## Routes

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/orders` | JWT |
| `POST` | `/api/orders` | JWT — optional `paymentMethod` |
| `GET` | `/api/orders/manage` | super-admin |
| `PATCH` | `/api/orders/:id/status` | super-admin |

## Depends on

- `SharedModule`, `OrderDbService` (`@database/services`)

## Exports

- `OrderService` — HTTP/DTO orchestration (payment uses `OrderDbService` directly for settle)

## Product features that touch this module

| Feature | What it uses on `Order` |
|---------|-------------------------|
| [Stripe](../../features/stripe/README.md) | Card create → `draft`+`unpaid`; cash → `pending`; webhook/sync → `paid`/`failed` + `draft`→`pending`; manage list hides drafts |
