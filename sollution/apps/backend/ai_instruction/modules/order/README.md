# Module: `order`

**Code:** [`src/modules/order/`](../../../src/modules/order/)

## What it’s for

Pickup orders: user create/list; admin manage + kitchen status.

## Routes

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/orders` | JWT |
| `POST` | `/api/orders` | JWT — optional `paymentMethod`; server assigns `orderCode` |
| `GET` | `/api/orders/manage` | super-admin |
| `PATCH` | `/api/orders/:id/status` | super-admin |

## Create guards (`POST /api/orders`)

Before insert, `OrderService` rejects checkout when:

| Check | HTTP | Body `code` |
|-------|------|-------------|
| Brand `store_status.isAvailable === false` | `503` | (message string / closed copy) |
| `branchId` set but branch missing or `active === false` | `400` | `BRANCH_UNAVAILABLE` |
| Any `menuItemId` missing or `available === false` | `400` | `ITEM_UNAVAILABLE` (+ `unavailableMenuItemIds`) |

Does **not** re-price or enforce stock quantities (boolean 86 only).

## Order codes

`order_code` is an **integer IDENTITY** column (`1`, `2`, `3`, …). Postgres assigns it on insert. Clients must not send `orderCode` (`forbidNonWhitelisted`).

## Depends on

- `SharedModule`, `EventsModule`
- `OrderDbService`, `SettingDbService`, `ProductDbService`, `BranchDbService` (`@database/services`)

## Exports

- `OrderService` — HTTP/DTO orchestration (payment uses `OrderDbService` directly for settle)

## Domain events

After a successful DB write, emits via [`events`](../events/README.md):

| Event | When |
|-------|------|
| `order.placed` | Create when `status !== draft` (cash). Card drafts wait for Stripe paid. |
| `order.status_changed` | Admin kitchen `PATCH …/status` |

## Product features that touch this module

| Feature | What it uses on `Order` |
|---------|-------------------------|
| [Stripe](../../features/stripe/README.md) | Card create → `draft`+`unpaid`; cash → `pending`; webhook/sync → `paid`/`failed` + `draft`→`pending`; user list hides drafts, admin manage shows them |
| [Live](../../features/live/README.md) | Emits `order.placed` (cash) + `order.status_changed` → SSE change feed |
| Store availability (`store_status` setting) | Create blocked when brand marked closed |
| Catalog 86 | Create blocked when products unavailable or pickup branch inactive |
