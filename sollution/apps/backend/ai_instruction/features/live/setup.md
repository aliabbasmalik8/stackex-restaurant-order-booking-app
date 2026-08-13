# Live — setup

SSE needs **no new env**. Same `JWT_SECRET` + `CORS_ORIGINS`.

## Streams

| Client | URL | Auth |
|--------|-----|------|
| Admin SPA | `GET {API}/api/live/admin/stream` | Super-admin Bearer |
| Guest app | `GET {API}/api/live/me/stream` | User Bearer |

Use `fetch` + `Authorization`, not `EventSource`.

Frames:

- `{ "type": "ping", "at": "…" }` keepalive
- `{ "type": "<APP_EVENTS name>", "payload": { … }, "at": "…" }`

`CORS_ORIGINS` must include the client origin.

## Adding a new change

1. Event in `events` catalog + payload (include `userId` if audience has `user`).
2. Row in `LIVE_AUDIENCE` (`admin` / `user` / both).
3. Emit after DB write.
4. Client maps `type` → query invalidation (or toast).

## Not this feature

- FCM / web push when the tab is closed — separate listener later.
- Persisted notification inbox.

## Related

- [README.md](./README.md)
- [modules/live](../../modules/live/README.md)
