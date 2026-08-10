# How to set up (local)

Maintainer guide for Nest + Postgres so you can run the API, seed catalog, create an admin user, and run the mobile app.

Paths from **template root**.

---

## 1. Postgres

- Postgres DB (local or Neon). Example: `order-booking`

---

## 2. Backend

```bash
cd sollution/apps/backend
pnpm install
cp .env.example .env
```

Fill at least:

| Key | Example |
|-----|---------|
| `PORT` | `8000` |
| `environment` | `development` |
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/order-booking` |
| `JWT_SECRET` | long random string |
| `CORS_ORIGINS` | optional allowlist (comma-separated) |

```bash
pnpm migration:run
pnpm start:dev
```

Health: http://localhost:8000/api/health  
API list: [../sollution/apps/backend/README.md](../sollution/apps/backend/README.md)

---

## 3. Scripts (seed + admin user)

```bash
cd scripts
pnpm install
cp .env.example .env
# DATABASE_URL = same database as backend
pnpm reseed
pnpm create:admin
```

Defaults for admin: `admin@example.com` / `PreviewAdmin123!` (override via flags or env).

Login:

```bash
curl -s -X POST http://localhost:8000/api/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"PreviewAdmin123!"}'
```

---

## 4. Mobile

```bash
cd sollution/apps/mobile
pnpm install
cp .env.example .env
# EXPO_PUBLIC_API_URL=http://localhost:8000
pnpm start
```

Mobile talks to Nest via React Query (`src/api/OrderBooking/`).  
Env: [environment.md](./environment.md) · app notes: [../sollution/README.md](../sollution/README.md).

---

## 5. Admin

```bash
cd sollution/apps/admin
pnpm install
cp .env.example .env
# VITE_API_URL=http://localhost:8000
pnpm dev
```

Same React Query layout as mobile / native-builder-frontend (`src/api/OrderBooking/modules/…`).  
Sign in with the super-admin from step 3.

---

## Checklist

| Step | Done when |
|------|-----------|
| DB reachable | `DATABASE_URL` works |
| Migrations | `pnpm migration:run` OK |
| Seed | `branch` / `category` / `product` rows exist |
| Admin user | `pnpm create:admin` + login returns tokens |
| API up | `/api/health` → `ok: true` |
| Mobile | Menu loads from Nest; login works |
| Admin | Login as super-admin; orders/products/categories load |
