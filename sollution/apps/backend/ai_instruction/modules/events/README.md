# Module: `events`

**Code:** [`src/modules/events/`](../../../src/modules/events/)

## What it’s for

Typed **in-process** domain event bus. Producers emit after persistence; other modules listen. No HTTP, no Redis, no extra env.

Same Node process only. Horizontal scale (multiple Nest instances) would need a later pub/sub channel — not this module.

## Routes

None.

## Folder

```text
events/
  events.module.ts       Nest wiring (`@Global`)
  events.service.ts      typed emit
  events.decorators.ts   @OnAppEvent
  events.types.ts        payload shapes
  index.ts               public API
  utils/
    catalog.ts           APP_EVENTS + AppEventMap
    audience.ts          LIVE_AUDIENCE (admin / user SSE routing)
    mappers.ts           Order row → payload
```

| File | Role |
|------|------|
| `events.module.ts` | `@Global()` + `EventEmitterModule.forRoot()`; export `EventsService` |
| `events.service.ts` | Typed `emit` — swallows bus errors so checkout never fails |
| `events.decorators.ts` | `@OnAppEvent` (typed `@OnEvent`) |
| `events.types.ts` | Payload shapes |
| `utils/catalog.ts` | **Source of truth** — event names + `AppEventMap` |
| `utils/audience.ts` | `LIVE_AUDIENCE` — who may see the event on live SSE |
| `utils/mappers.ts` | Order row → payload |
| `index.ts` | Public API for other modules |

## Catalog (current)

| Event | When | Payload |
|-------|------|---------|
| `order.placed` | Cash `POST /api/orders` (`pending`); card after first Stripe success (`draft`→`pending`, `paid`) | `OrderPlacedPayload` |
| `order.status_changed` | Super-admin `PATCH /api/orders/:id/status` | `OrderStatusChangedPayload` (`userId` included) |

Card **create** (`draft` + `unpaid`) does **not** emit `order.placed`. Failed card payments do **not** emit it.

## How to add an event

1. Payload type in `events.types.ts`
2. Name under `APP_EVENTS` + matching key on `AppEventMap` in `utils/catalog.ts` (compile-time exhaustiveness)
3. Optional mapper in `utils/mappers.ts`
4. `LIVE_AUDIENCE` in `utils/audience.ts` (`admin` / `user` / both / `LIVE_AUDIENCE_NONE`; include `userId` if `user`)
5. `this.events.emit(APP_EVENTS.<domain>.<action>, payload)` **after** DB write
6. Listener: `@OnAppEvent(APP_EVENTS.<domain>.<action>)` on a provider in another module  
   (`live` routes catalog events to `/api/live/admin/stream` and/or `/api/live/me/stream`)

```ts
@OnAppEvent(APP_EVENTS.order.placed)
handleOrderPlaced(payload: AppEventMap[typeof APP_EVENTS.order.placed]) {}
```

Do **not** use raw event strings in services. Do **not** put brand/currency/copy in payloads — listeners refetch or read **settings**.

## Depends on

- `@nestjs/event-emitter` (in-process `EventEmitter2`)

## Exports

- `EventsService` — typed emit
- Catalog helpers via `index.ts` (`APP_EVENTS`, `LIVE_AUDIENCE`, `LIVE_AUDIENCE_NONE`, `@OnAppEvent`, mappers)

`EventsModule` is `@Global()` (registered in `AppModule`). Feature modules that emit still **import** it so the dependency stays visible.

## Product features

| Feature | What it uses |
|---------|----------------|
| [Live](../../features/live/README.md) | `live` forwards catalog events to SSE — not here |

## Related

- [order](../order/README.md) — emits `order.placed` (cash) + `order.status_changed`
- [stripe-payments](../stripe-payments/README.md) — emits `order.placed` on first paid
- [live](../live/README.md) — SSE change-feed listener
