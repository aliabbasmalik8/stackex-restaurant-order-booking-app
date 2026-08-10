# Admin (Vite + React)

White-label **restaurant admin** SPA. Static-build friendly — `pnpm build` outputs `dist/` for nginx / VM serve.

## Run

```bash
cd apps/admin
pnpm install
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
├── vite.config.ts          ← Tailwind plugin + `@/` alias + base `./`
├── src/
│   ├── main.tsx            ← applyTheme() then mount
│   ├── App.tsx
│   ├── index.css           ← Tailwind + theme utilities
│   ├── theme/              ← white-label tokens (mirrors mobile)
│   │   ├── brand.ts        ← paletteId / name / monogram
│   │   ├── palettes.ts
│   │   ├── applyTheme.ts   ← writes CSS variables on :root
│   │   └── …
│   ├── i18n/               ← en / ar + RTL (localStorage)
│   ├── components/ui/      ← Button · Text · BrandMark
│   └── screens/
│       └── WelcomeScreen.tsx
└── dist/                   ← static output after build
```

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
