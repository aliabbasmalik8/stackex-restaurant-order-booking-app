# Order Booking solution

White-label restaurant **pickup** ordering app (Stackex).

This folder is the **shippable solution**. Template root also has `.docs/`, `scripts/`, and `claude-design/` — not part of the app bundle.  
**Data / auth:** Nest + Postgres. Mobile uses React Query → Nest `/api`.  
Full map: **[../.docs/overview.md](../.docs/overview.md)**.

## Layout

```text
sollution/
├── apps/
│   ├── mobile/          ← Expo guest app (Nest API)
│   ├── web/             ← Vite guest SPA (same Nest API, desktop layout)
│   ├── admin/           ← Vite + React admin SPA
│   └── backend/         ← NestJS API + TypeORM
└── README.md
```

Each app installs on its own (no root workspace).

**Maintainers:** [../.docs/](../.docs/README.md) · database: [../.docs/database.md](../.docs/database.md)

Design reference: `../claude-design/all-screens/Restaurant pickup ordering app/`

## Backend

```bash
cd apps/backend
pnpm install
cp .env.example .env
pnpm migration:run
pnpm start:dev
```

See `apps/backend/README.md` for the full API list.

Seed + admin user (from template root):

```bash
cd ../../scripts
pnpm reseed
pnpm create:admin
```

## Mobile

```bash
cd apps/mobile
pnpm install
cp .env.example .env
# EXPO_PUBLIC_API_URL=http://localhost:8000
pnpm start
```

| Script | What it does |
|--------|----------------|
| `pnpm start` | Expo DevTools |
| `pnpm ios` / `pnpm android` | Native simulators |
| `pnpm web` | Web preview |

Env: [../.docs/environment.md](../.docs/environment.md).

### API + React Query

```text
src/api/OrderBooking/
  client.ts · queryClient.ts
  modules/user | branches | categories | products | orders
```

Same layout as native-builder-frontend (`[name].ts` + `[name]Hooks.ts` + `[name].types.ts`).

### Services (preview feature gates)

Apple / Google and future addons: `src/modules/services` — [../.docs/services.md](../.docs/services.md).

### Stack notes (VM preview)

- **pnpm** with `node-linker=hoisted` (`.npmrc`)
- **metro.config.js** uses `withStackExMetro` from `@stackex/toolkit-sdk`
- Path aliases: `@/*` → `src/*`

### App structure

```text
apps/mobile/
├── app/                         ← Expo Router routes
├── src/
│   ├── api/OrderBooking/        ← Nest HTTP + React Query
│   ├── modules/auth|catalog|orders|profile|services/
│   ├── theme/
│   └── …
```

### Current screens

| Screen | Status |
|--------|--------|
| Sign In / Sign Up | Done (Nest JWT) |
| Menu / Item / Cart / Checkout | Done (Nest catalog + orders) |
| Orders / Profile | Done |

## Web

Guest desktop SPA (Vite + React). Same Nest API and Firebase auth as mobile.

```bash
cd apps/web
pnpm install
cp .env.example .env
pnpm dev
```

Dev: `http://localhost:5174` — add that origin to backend `CORS_ORIGINS`.

| Screen | Status |
|--------|--------|
| Sign In / Sign Up / Forgot password | Done |
| Menu + cart rail + item modal | Done |
| Checkout / confirmation | Done |
| Orders / Profile | Done |

## Admin

Pending Nest cutover — ignore for now. See `apps/admin/README.md` when ready.

### White-label theme

Change brand in `apps/mobile/src/theme/brand.ts` (`paletteId`, name, dial).  
Palettes: `charcoal` · `red` · `dark` · `emerald` · `saffron` · `midnight` · `olive`

### i18n

- Locales: `src/i18n/locales/en.ts` · `ar.ts`
- Arabic RTL via `I18nManager`
