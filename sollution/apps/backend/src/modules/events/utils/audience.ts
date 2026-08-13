import { APP_EVENTS, type AppEventName } from './catalog';

/** Who may receive this event on the live SSE channels. */
export type LiveAudience = 'admin' | 'user';

/**
 * Catalog → live routing. Add a row when you add `APP_EVENTS`.
 * - `admin` — every connected super-admin (`/api/live/admin/stream`)
 * - `user` — only `/api/live/me/stream` for `payload.userId`
 */
export const LIVE_AUDIENCE: Record<AppEventName, readonly LiveAudience[]> = {
  [APP_EVENTS.order.placed]: ['admin', 'user'],
  [APP_EVENTS.order.statusChanged]: ['admin', 'user'],
};

export function liveAudiencesFor(type: AppEventName): readonly LiveAudience[] {
  return LIVE_AUDIENCE[type];
}
