# Admin (Vite + React)

White-label **restaurant admin** SPA. Static-build friendly — `pnpm build` outputs `dist/` for nginx / VM serve.

Talks to the Nest backend via React Query (`src/api/OrderBooking/`), same layout as native-builder-frontend.

## Run

```bash
cd apps/admin
pnpm install
cp .env.example .env   # VITE_API_URL
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
├── vite.config.ts          ← Tailwind + `@/` + VITE_ envPrefix
├── .env.example            ← VITE_API_URL
├── src/
│   ├── main.tsx
│   ├── App.tsx             ← QueryClient + Language + Auth + BrowserRouter
│   ├── AppRoutes.tsx       ← /login · /orders · /products · /categories
│   ├── api/OrderBooking/   ← axios client + React Query modules
│   │   ├── client.ts
│   │   ├── queryClient.ts
│   │   └── modules/        ← [name].ts · [name]Hooks.ts · [name].types.ts
│   ├── modules/auth/
│   ├── modules/orders/
│   ├── modules/products/
│   ├── modules/categories/
│   ├── components/layout/
│   ├── components/ui/
│   ├── components/auth/
│   └── screens/
└── dist/
```

Routes (after login): `/orders` · `/products` · `/products/:id` · `/categories` · `/categories/:id`

## API / auth

```bash
VITE_API_URL=http://localhost:8000
```

Auth: Nest `POST /api/users/login` — account must have `is_super_admin`. Create one with:

```bash
cd scripts
pnpm create:admin
```

See [../../.docs/howto-setup-local.md](../../.docs/howto-setup-local.md).

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

`BrowserRouter` needs an SPA fallback so deep links (`/orders`, `/products/…`) return `index.html`:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

`vite.config.ts` uses `base: '/'` so asset paths resolve correctly with path-based routes.
