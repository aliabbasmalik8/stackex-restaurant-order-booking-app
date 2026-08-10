# Environment contract

## Backend (`sollution/apps/backend/.env`)

| Key | Purpose |
|-----|---------|
| `PORT` | HTTP port (default `8000`) |
| `environment` | `development` \| `staging` \| `production` (SSL off in development) |
| `DATABASE_URL` | Postgres |
| `JWT_SECRET` | Access token secret |
| `CORS_ORIGINS` | Comma-separated browser origins (no trailing slash). Empty = allow any |

Example: `sollution/apps/backend/.env.example`

## Scripts (`scripts/.env`)

| Key | Purpose |
|-----|---------|
| `DATABASE_URL` | Same Postgres as backend |
| `SEED_DATA_PATH` | Optional override (default `scripts/seed-data.json`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_DISPLAY_NAME` | Optional `create:admin` overrides |

Example: `scripts/.env.example`

## Mobile (`sollution/apps/mobile/.env`)

| Key | Purpose |
|-----|---------|
| `EXPO_PUBLIC_API_URL` | Nest origin **without** `/api` (client appends it). Example: `http://localhost:8000` |
| `EXPO_PUBLIC_PREVIEW_MODE` | Optional preview welcome — [preview-mode.md](./preview-mode.md) |
| `EXPO_PUBLIC_SERVICE_*` | Optional addon gates — [services.md](./services.md) |

Example: `sollution/apps/mobile/.env.example`

On a physical device / Android emulator, use your machine LAN IP instead of `localhost`.

## Admin

Admin SPA is **not** cut over to Nest yet — leave it alone for now.

## Secrets

- Never commit `.env` or service-account JSON
- Prefer Neon / managed Postgres `DATABASE_URL` for shared previews
