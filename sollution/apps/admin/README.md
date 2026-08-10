# Admin (Vite + React)

White-label **restaurant admin** SPA. Static-build friendly — `pnpm build` outputs `dist/` for nginx / VM serve.

## Run

```bash
cd apps/admin
pnpm install
cp .env.example .env   # six FIREBASE_* keys
pnpm dev
```

| Script | What it does |
|--------|----------------|
| `pnpm dev` | Vite dev server |
| `pnpm build` | Typecheck + static build → `dist/` |
| `pnpm preview` | Serve `dist/` locally |
| `pnpm lint` | Oxlint |

## Structure

```text
apps/admin/
├── index.html
├── vite.config.ts          ← Tailwind + `@/` + FIREBASE_ envPrefix
├── .env.example            ← six FIREBASE_* keys
├── src/
│   ├── main.tsx
│   ├── App.tsx             ← Language + Auth + HashRouter
│   ├── AppRoutes.tsx       ← /login · /orders · /users
│   ├── lib/firebase*.ts    ← Firebase app / auth / firestore
│   ├── modules/auth/
│   ├── modules/orders/     ← list all orders
│   ├── modules/users/      ← list profiles
│   ├── components/layout/  ← DashboardLayout · PageHeader · StateBlock
│   ├── components/ui/
│   ├── components/auth/
│   └── screens/
│       ├── LoginScreen.tsx
│       ├── OrdersScreen.tsx
│       └── UsersScreen.tsx
└── dist/
```

Routes (after login): `/orders` · `/users`

## Firebase

Plain `FIREBASE_*` keys (no Expo / Vite prefix):

```bash
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

```bash
cp .env.example .env
# fill from Firebase Console Web app config (same values as mobile, different key names)
```

Auth lives under `src/modules/auth/`:
- `api.ts` — `signInAdmin` / `signOutAdmin` / admin-claim check
- `hooks/useLogin.ts` — form state + submit
- `AuthContext.tsx` — session + auto sign-out if `admin != true`

Login requires Firebase Auth custom claim **`admin: true`** (same as Firestore rules `request.auth.token.admin == true`). Non-admin users are signed out immediately.

### Extra step you must do

The Web client config alone is not enough — the admin user needs the claim set (Admin SDK / Console), e.g.:

```js
admin.auth().setCustomUserClaims(uid, { admin: true })
```

Then the user must refresh their ID token (re-login works). Preview backend may provision this when `should_config_admin` is true in `firebase/config.json`.

## White-label theme

Change brand look in **one place**: `src/theme/brand.ts`

```ts
export const brand = {
  paletteId: 'midnight', // charcoal | red | dark | emerald | saffron | midnight | olive
  name: 'Sanam Grill',
  monogram: 'S',
  product: 'Admin',
}
```

Same palette ids as the mobile guest app. Tokens land as CSS variables via `applyTheme()`; UI uses Tailwind utilities (`bg-page`, `text-ink`, `bg-cta`, …) or `colors` from `@/theme`.

Fonts: **Sora** (display) + **Manrope** (UI).

## i18n (English + Arabic)

- Locales: `src/i18n/locales/en.ts` · `ar.ts`
- Preference persisted in `localStorage` (`@order-booking/admin-locale`)
- Arabic sets `dir="rtl"` on `<html>` (no reload needed on web)
- Use `useTranslation()` in screens; `useLanguage()` to read/set locale

## Static deploy (VM)

```bash
pnpm build
# copy dist/ to your VM and serve with nginx (SPA fallback to index.html)
```

`vite.config.ts` uses `base: './'` so asset paths work when served from a subdirectory or static root.
