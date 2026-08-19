# Order Booking web (guest)

Vite + React guest SPA for restaurant pickup ordering. Same Nest API and auth as mobile; desktop layout from the Claude web design.

HTTP: `VITE_API_URL` + `/api` → Nest backend.

```bash
cd apps/web
pnpm install
cp .env.example .env
pnpm dev
```

Dev server: `http://localhost:5174`

Add `http://localhost:5174` to backend `CORS_ORIGINS`.

## Current screens

| Path | Screen |
|------|--------|
| `/sign-in` | Sign in (email → status → password, Google, guest) |
| `/sign-up` | Create account |
| `/forgot-password` | Firebase reset email |
| `/menu` | Menu + persistent cart rail + item modal |
| `/checkout` | Pickup time, contact, cash or card |
| `/payment` | Stripe Payment Element (when `VITE_STRIPE_PUBLISHABLE_KEY` is set) |
| `/order-success` | Pickup code + tracker |
| `/orders` | Current / previous orders |
| `/profile` | Name and contact phone |

See `ai_instruction/` for architecture.
