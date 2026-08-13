# Feature: Live

One SSE **system-change stream** so clients can react to any catalog domain event (invalidate lists, optional toast, later more resources).

Internal bus stays `events` (emit-and-forget). `live` is **one listener** that forwards catalog events to connected browsers. FCM / email are other listeners — not this module.

No extra env. Omit `LiveModule` only if a deploy must ship without a live feed (HTTP poll still works).

## Modules that use it

| Nest module | Role |
|-------------|------|
| [`events`](../../modules/events/README.md) | Typed emit (`APP_EVENTS`) |
| [`live`](../../modules/live/README.md) | Listener + SSE `/api/live/admin/stream` + `/api/live/me/stream` (`LIVE_AUDIENCE`) |
| [`order`](../../modules/order/README.md) | Emits `order.placed` (cash) + `order.status_changed` |
| [`stripe-payments`](../../modules/stripe-payments/README.md) | Emits `order.placed` on first paid |

Clients: **admin SPA** → `/api/live/admin/stream` (SSE bus + `useLiveEvent` / invalidate / order toasts); guest app → `/api/live/me/stream` (not yet).

## Setup

→ **[setup.md](./setup.md)**
