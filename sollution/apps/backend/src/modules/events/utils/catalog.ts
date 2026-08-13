import type {
  OrderPlacedPayload,
  OrderStatusChangedPayload,
} from '../events.types';

/**
 * Canonical in-process domain events for this white-label.
 *
 * Add an event:
 * 1. Payload type in `events.types.ts`
 * 2. Dotted name under `APP_EVENTS` (`<domain>.<action>`)
 * 3. Same string on `AppEventMap`
 * 4. Optional mapper in `utils/mappers.ts`
 * 5. Emit via `EventsService.emit(APP_EVENTS…, payload)` after persistence
 * 6. Listen with `@OnAppEvent(APP_EVENTS…)`
 *
 * Do not invent string literals in services. Names are generic (no brand forks).
 */
export const APP_EVENTS = {
  order: {
    /** Kitchen-visible new order: cash create, or card after payment succeeds. */
    placed: 'order.placed',
    /** Admin kitchen status patch (`pending` → `confirmed` → …). */
    statusChanged: 'order.status_changed',
  },
} as const;

type NestedValues<T> = T extends string
  ? T
  : { [K in keyof T]: NestedValues<T[K]> }[keyof T];

export type AppEventName = NestedValues<typeof APP_EVENTS>;

export type AppEventMap = {
  [APP_EVENTS.order.placed]: OrderPlacedPayload;
  [APP_EVENTS.order.statusChanged]: OrderStatusChangedPayload;
};

/** Compile error if a catalog name is missing from `AppEventMap` (or vice versa). */
type _CatalogCovered = AppEventName extends keyof AppEventMap ? true : never;
type _MapCovered = keyof AppEventMap extends AppEventName ? true : never;
const _exhaustive: [_CatalogCovered, _MapCovered] = [true, true];
void _exhaustive;

export type AppEventPayload<K extends keyof AppEventMap> = AppEventMap[K];
