# Order Booking solution

White-label restaurant **pickup** ordering app (Stackex).

This folder is the **shippable solution**. Template root also has `.docs/`, `scripts/`, and `claude-design/` — not part of the app bundle.  
**Data / auth:** Nest + Postgres. Full map: **[../.docs/overview.md](../.docs/overview.md)**.

## Layout

```text
sollution/
├── apps/
│   ├── mobile/          ← Expo guest app
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

Auth: `POST /api/users/signup` · `POST /api/users/login` · `GET /api/users/me`  
See `apps/backend/README.md`.

Seed + admin (from template root):

```bash
cd ../scripts   # from sollution/ → use ../../scripts from apps/backend
pnpm reseed
pnpm create:admin
```

## Mobile

```bash
cd apps/mobile
pnpm install
cp .env.example .env
pnpm start
```

| Script | What it does |
|--------|----------------|
| `pnpm start` | Expo DevTools |
| `pnpm ios` / `pnpm android` | Native simulators |
| `pnpm web` | Web preview |

**Note:** Mobile/admin may still contain legacy Firebase client modules while cutover to Nest continues. Target API: [../.docs/environment.md](../.docs/environment.md).

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
│   ├── modules/catalog/         ← (migrating off Firestore → Nest)
│   ├── modules/orders/
│   ├── modules/services/
│   ├── theme/
│   └── …
```

### Current screens

| Screen | Status |
|--------|--------|
| Sign In / Sign Up | Done (legacy Firebase client until API wired) |
| Menu / Item / Cart / Checkout | Done |
| Orders / Profile | Done |

## Admin

```bash
cd apps/admin
pnpm install
pnpm dev
```

Static build: `pnpm build` → `dist/`. See `apps/admin/README.md`.

### White-label theme

Change brand in `apps/mobile/src/theme/brand.ts` (`paletteId`, name, dial).  
Palettes: `charcoal` · `red` · `dark` · `emerald` · `saffron` · `midnight` · `olive`

### i18n

- Locales: `src/i18n/locales/en.ts` · `ar.ts`
- Arabic RTL via `I18nManager`
