# Order Booking solution

White-label restaurant **pickup** ordering app (Stackex). Pseudo-monorepo matching the native-builder template pattern (same pnpm + Metro setup as order-desk for VM preview).

This folder is the **shippable solution**. Template root also has `.docs/`, `firebase/`, `scripts/`, and `claude-design/` — those are not part of the app bundle. Full split + mapping: **[../.docs/overview.md](../.docs/overview.md)**.

## Layout

```text
sollution/
├── apps/
│   ├── mobile/          ← Expo guest app (Expo Router)
│   ├── admin/           ← Vite + React admin SPA (static build)
│   └── backend/         ← NestJS API (health for now)
├── shared/              ← schemas, types, constants (@repo/shared)
└── README.md
```

There is **no root package.json / pnpm-workspace**. Each app installs on its own. `shared/` is a bare TypeScript folder linked via Metro + tsconfig as `@repo/shared`.

**Maintainers:** [../.docs/](../.docs/README.md) — purpose, `sollution/` vs the rest, folder / collection / env map.

Design source (reference only): `../claude-design/all-screens/Restaurant pickup ordering app/`

## Mobile

```bash
cd apps/mobile
pnpm install
cp .env.example .env   # only the six EXPO_PUBLIC_FIREBASE_* keys — see ../.docs/environment.md
pnpm start
```

How to map Console Web config → those keys (and why the list is fixed by the main backend): [../.docs/environment.md](../.docs/environment.md).

| Script | What it does |
|--------|----------------|
| `pnpm start` | Expo DevTools |
| `pnpm ios` / `pnpm android` | Native simulators |
| `pnpm web` | Web preview |
| `pnpm start-tunnel` | Tunnel for remote devices |

### Firebase (catalog)

Menu loads from Firestore via `src/modules/catalog` (not a mock menu file).

| Step | Where |
|------|--------|
| Env | `.env` — six `EXPO_PUBLIC_FIREBASE_*` keys ([../.docs/environment.md](../.docs/environment.md)) |
| Rules | `../firebase/firestore.custom.rules` on the Firebase project |
| Seed | from template root: `cd scripts && pnpm reseed` |
| Schema / rename collections | [../.docs/firebase.md](../.docs/firebase.md) |

Module notes: `apps/mobile/src/modules/catalog/README.md`.

### Services (preview feature gates)

Apple / Google and future addons are gated via `src/modules/services` (`enabled` · `disabled` · `hidden`). Maintainer mental model: [../.docs/services.md](../.docs/services.md).

### Stack notes (VM preview)

- **pnpm** with `node-linker=hoisted` (`.npmrc`)
- **metro.config.js** uses `withStackExMetro` from `@stackex/toolkit-sdk` and watches `../../shared`
- Path aliases: `@/*` → `src/*`, `@repo/shared` → `../../shared`

### App structure

```text
apps/mobile/
├── app/                         ← Expo Router routes
│   ├── index.tsx                ← Sign In
│   ├── sign-up.tsx · verify.tsx
│   ├── (tabs)/                  ← menu · orders · profile
│   ├── item/[id].tsx
│   ├── cart.tsx · checkout.tsx · order-success.tsx
│   └── _layout.tsx
├── src/
│   ├── AppProvider.tsx          ← fonts, gesture, providers
│   ├── modules/catalog/         ← Firestore menu (live)
│   ├── modules/orders/          ← Firestore orders (create + list)
│   ├── modules/services/        ← preview feature availability
│   ├── lib/                     ← firebase + firebaseEnv
│   ├── data/demo.ts             ← VAT rate
│   ├── context/                 ← cart, auth, etc.
│   ├── theme/                   ← white-label tokens
│   ├── i18n/                    ← en / ar + RTL
│   ├── components/
│   └── screens/
└── metro.config.js
```

### Current screens

| Screen | Status |
|--------|--------|
| Sign In | Done |
| Sign Up | Done |
| Verify code (OTP) | Done — UI only, any 4 digits continues |
| Menu (home) | Done — Firestore catalog + live cart bar |
| Item detail | Done — modifiers + add to cart |
| Cart | Done — qty, VAT, continue |
| Checkout | Done — pickup time + payment UI |
| Confirmation | Done — pickup code |
| Orders | Done — Firestore current / previous + empty state |
| Profile | Done — auth profile + gated settings |

**Demo flow:** Menu → Item → Add → Cart → Checkout → Place order → Confirmation → Back to menu.

## Admin

```bash
cd apps/admin
pnpm install
pnpm dev
```

Static build: `pnpm build` → `dist/` (serve from VM / nginx). Theme mirrors mobile palettes — see `apps/admin/README.md`.

## Backend

```bash
cd apps/backend
pnpm install
cp .env.example .env
pnpm start:dev
```

NestJS API (health only for now). Default: [http://localhost:8000/api/health](http://localhost:8000/api/health). See `apps/backend/README.md`.

### White-label theme

Change brand look in **one place**: `apps/mobile/src/theme/brand.ts`

```ts
export const brand = {
  paletteId: 'midnight', // ← switch palette here
  name: 'Sanam Grill',
  monogram: 'S',
  dialCode: '+971',
  dialFlag: '🇦🇪',
  dialRegion: 'AE',
};
```

**Palette ids:** `charcoal` · `red` · `dark` · `emerald` · `saffron` · `midnight` (default) · `olive`

Full token sets live in `palettes.ts`. Resolved tokens export as `colors` from `@/theme`. **UI must import theme tokens — never hardcode brand hexes.**

Fonts (design): **Sora** (display) + **Manrope** (UI).

### i18n (English + Arabic)

- Locales: `src/i18n/locales/en.ts` · `ar.ts`
- Profile → **Language** opens a bottom sheet to switch locale
- Arabic enables RTL (`I18nManager`) and reloads when direction flips
- Preference persisted with AsyncStorage

### UI primitives

Reusable under `src/components/ui/`: `Text`, `Button`, `PhoneField`, `BrandMark`, `OrDivider`, plus shared state UI (`StateMessage`, etc.).

Screens compose these; keep new shared controls here so white-label clients stay consistent.
