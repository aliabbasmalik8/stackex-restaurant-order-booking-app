# Environment contract

## Backend (`sollution/apps/backend/.env`)

| Key | Purpose |
|-----|---------|
| `PORT` | HTTP port (default `8000`) |
| `environment` | `development` \| `staging` \| `production` (SSL off in development) |
| `DATABASE_URL` | Postgres |
| `JWT_SECRET` | Access token secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `REDIS_URL_DEFAULT` | Auth session store |

Example: `sollution/apps/backend/.env.example`

## Scripts (`scripts/.env`)

| Key | Purpose |
|-----|---------|
| `DATABASE_URL` | Same Postgres as backend |
| `SEED_DATA_PATH` | Optional override (default `scripts/seed-data.json`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_DISPLAY_NAME` | Optional `create:admin` overrides |

Example: `scripts/.env.example`

## Mobile / admin (migration)

**Target:** point apps at Nest with something like:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8000/api
# admin Vite:
VITE_API_URL=http://localhost:8000/api
```

Legacy `EXPO_PUBLIC_FIREBASE_*` / admin Firebase keys may still exist in app code until clients are fully cut over. Do **not** add new Firebase client keys for this template’s data path — catalog and auth are owned by the Nest backend.

Optional preview / addon toggles: `EXPO_PUBLIC_PREVIEW_MODE`, `EXPO_PUBLIC_SERVICE_*` — [preview-mode.md](./preview-mode.md) · [services.md](./services.md).

## Secrets

- Never commit `.env` or service-account JSON
- Prefer Neon / managed Postgres `DATABASE_URL` for shared previews
