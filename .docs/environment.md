# Environment contract

## Backend (`sollution/apps/backend/.env`)

| Key | Purpose |
|-----|---------|
| `PORT` | HTTP port (default `8000`) |
| `environment` | `development` \| `staging` \| `production` (SSL off in development) |
| `DATABASE_URL` | Postgres |
| `JWT_SECRET` | Access token secret |
| `CORS_ORIGINS` | Comma-separated browser origins (no trailing slash). Empty = allow any |
| `GOOGLE_MAPS_API_KEY` | Optional. Geocoding + Places server key — omit → Maps address routes return 503 |
| `IS_PUBLIC_PREVIEW_MODE` | Optional. Seed a default pin near the kitchen for **new** users — [preview-mode.md](./preview-mode.md) |

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
| `EXPO_PUBLIC_FIREBASE_*` | Firebase client config — see `firebase/.env.example` |
| `EXPO_PUBLIC_FEATURE_GOOGLE_AUTH` | Enable Google button (also needs Firebase client keys) |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Native Google OAuth (Expo); optional on web popup |
| `EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY` | Optional. Maps JavaScript API key for the **web** pin map (HTTP referrers). Not the Nest `GOOGLE_MAPS_API_KEY`. Omit → web stand-in |

Example: `sollution/apps/mobile/.env.example`

On a physical device / Android emulator, use your machine LAN IP instead of `localhost`.

## Firebase Admin (backend)

| Key | Purpose |
|-----|---------|
| `FIREBASE_PROJECT_ID` | Same project as client |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Service account private key (one line, `\n` escapes) |

Contract + examples: `firebase/.env.example`. Backend verifies Firebase ID tokens then issues Nest JWTs (`POST /api/auth/firebase`).

## Admin (`sollution/apps/admin/.env`)

| Key | Purpose |
|-----|---------|
| `VITE_API_URL` | Nest origin **without** `/api` (client appends it). Example: `http://localhost:8000` |
| `VITE_IS_PUBLIC_PREVIEW_MODE` | Optional env — admin UI blocks closing the store, product image upload, and branch delivery-location edit — [preview-mode.md](./preview-mode.md) |
| `VITE_GOOGLE_MAPS_WEB_KEY` | Optional. Maps JavaScript API key for the **branch pin editor** only (HTTP referrers, e.g. `http://localhost:5173/*`). Not the Nest `GOOGLE_MAPS_API_KEY`. Omit → lat/lng number fields only. Map script loads when the operator clicks “Edit pin on map”. |

Example: `sollution/apps/admin/.env.example`

Admin login requires `is_super_admin` (create via `scripts` `pnpm create:admin`).

## Secrets

- Never commit `.env` or service-account JSON
- Prefer Neon / managed Postgres `DATABASE_URL` for shared previews
