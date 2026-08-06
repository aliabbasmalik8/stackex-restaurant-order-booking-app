# Order Booking solution

White-label restaurant **pickup** ordering app (Stackex). Pseudo-monorepo matching the native-builder template pattern (same pnpm + Metro setup as order-desk for VM preview).

## Layout

```
sollution/
├── apps/
│   └── mobile/          ← Expo guest app (Expo Router)
├── shared/              ← schemas, types, constants (@repo/shared)
└── README.md
```

There is **no root package.json / pnpm-workspace**. Each app installs on its own. `shared/` is a bare TypeScript folder linked via Metro + tsconfig as `@repo/shared`.

Design source (reference only):

`../claude-design/all-screens/Restaurant pickup ordering app/`

## Mobile

```bash
cd apps/mobile
pnpm install
pnpm start
```

| Script | What it does |
|--------|----------------|
| `pnpm start` | Expo DevTools |
| `pnpm ios` / `pnpm android` | Native simulators |
| `pnpm web` | Web preview |
| `pnpm start-tunnel` | Tunnel for remote devices |

### Stack notes (VM preview)

- **pnpm** with `node-linker=hoisted` (`.npmrc`)
- **metro.config.js** uses `withStackExMetro` from `@stackex/toolkit-sdk` and watches `../../shared`
- Path aliases: `@/*` → `src/*`, `@repo/shared` → `../../shared`

### App structure

```
apps/mobile/
├── app/                      ← Expo Router screens
│   ├── _layout.tsx
│   └── index.tsx             ← Sign In (current entry)
├── src/
│   ├── AppProvider.tsx       ← fonts + gesture root
│   ├── theme/                ← white-label tokens
│   ├── components/ui/        ← shared primitives
│   ├── screens/auth/         ← feature screens
│   └── constants/
└── metro.config.js
```

### Current screens

| Screen | Status |
|--------|--------|
| Sign In | Done |
| Sign Up | Done |
| Verify code (OTP) | Done — UI only, any 4 digits continues |
| Menu (home) | Done — live cart bar |
| Item detail | Done — modifiers + add to cart |
| Cart | Done — qty, VAT, continue |
| Checkout | Done — pickup time + payment UI |
| Confirmation | Done — pickup code |
| Orders | Done — active + past (mock) |
| Profile | Done — loyalty + settings |

**Demo flow:** Menu → Item → Add → Cart → Checkout → Place order → Confirmation → Back to menu. Orders tab shows the active order after checkout.

### White-label theme

Change brand look in **one place**:

`apps/mobile/src/theme/brand.ts`

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

### i18n (English + Arabic)

- Locales: `src/i18n/locales/en.ts` · `ar.ts`
- Profile → **Language** opens a bottom sheet to switch locale
- Arabic enables RTL (`I18nManager`) and reloads the app when direction flips
- Preference is persisted with AsyncStorage

**Palette ids** (from design Tweaks):

| Id | Feel |
|----|------|
| `charcoal` | Dark hero, red CTA |
| `red` | Red hero, charcoal CTA |
| `dark` | Full dark mode |
| `emerald` | Green / gold accents |
| `saffron` | Warm orange hero |
| `midnight` | Navy + gold (default) |
| `olive` | Muted olive |

Full token sets live in `palettes.ts` (names match the design doc: `heroBg`, `ctaBg`, `ink`, …).

Resolved tokens export as `colors` from `@/theme`. **UI must import theme tokens — never hardcode brand hexes.**

Fonts (design): **Sora** (display) + **Manrope** (UI).

### UI primitives

Reusable under `src/components/ui/`:

- `Text` — display / title / body / label variants
- `Button` — `primary` \| `social`
- `PhoneField` — dial code + number
- `BrandMark` — monogram tile
- `OrDivider` — “or continue with” rule

Screens compose these; keep new shared controls here so white-label clients stay consistent.
