# Module: `live`

**Code:** [`src/modules/live/`](../../../src/modules/live/)

## What it’s for

**System change feed.** Listens on **events** and forwards catalog events over SSE, **routed by audience**.

Not toast/FCM. Clients decide UI. Backend only answers: what happened + who may see it.

## Routes

| Method | Path | Auth | Who hears |
|--------|------|------|-----------|
| `GET` (SSE) | `/api/live/admin/stream` | JWT + super-admin | All events marked `admin` (broadcast to every connected admin) |
| `GET` (SSE) | `/api/live/me/stream` | JWT | Events marked `user` **for this `userId` only** |

Client must send `Authorization: Bearer` (`fetch`, not `EventSource`).

Keepalive `ping` every ~25s on each connection.

## Audience (`LIVE_AUDIENCE`)

Defined next to the event catalog: [`events/utils/audience.ts`](../../../src/modules/events/utils/audience.ts).

| Audience | Channel |
|----------|---------|
| `admin` | `/admin/stream` — all super-admins |
| `user` | `/me/stream` — `payload.userId` only (skip + warn if missing) |
| `LIVE_AUDIENCE_NONE` (`[]`) | No SSE — emit still runs; other listeners still run (debug log) |

Today:

| Event | Audience |
|-------|----------|
| `order.placed` | admin + user |
| `order.status_changed` | admin + user (`userId` on payload) |

Add a catalog event → set `LIVE_AUDIENCE` → emit. No live-listener edit.

## Files

| File | Role |
|------|------|
| `live.module.ts` | Nest wiring |
| `live.controller.ts` | Admin + me SSE routes |
| `live.service.ts` | Route by audience + pings |
| `live.listener.ts` | `onAny` → `publish` catalog names only |
| `live.types.ts` | SSE message shapes |
| `channels/sse.channel.ts` | Admin Subject + per-`userId` Subjects |

## Stream messages

| `type` | Meaning |
|--------|---------|
| `ping` | Keepalive — ignore |
| any `APP_EVENTS` name | Domain change (`payload` matches `AppEventMap`) |

Do **not** put contact, items, or brand copy on the stream.

## Depends on

- `SharedModule` (auth guards)
- `EventsModule` (`EventEmitter2`, `isAppEventName`, `LIVE_AUDIENCE`)

## Exports

None.

## Product features

| Feature | Doc |
|---------|-----|
| [Live](../../features/live/README.md) | SSE change feed + audience routing |

## Related

- [events](../events/README.md)
- [order](../order/README.md) / [stripe-payments](../stripe-payments/README.md)
- Admin SPA: [`../../../admin/ai_instruction/architecture.md`](../../../admin/ai_instruction/architecture.md) (Live stream)
