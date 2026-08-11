# Modules & addons (portable pattern)

How shippable apps under `sollution/` organize domain code and gate preview/customer **addons**.  
Copy this pattern into **other native-builder solutions** — swap domain names, keep the contracts.

Paths are from **template root**. Shippable code lives under `sollution/apps/<app>/src/modules/` (and Nest modules under `apps/backend/src/modules/`).

---

## Two layers (do not confuse)

| Layer | What it is | Lives in | Env |
|-------|------------|----------|-----|
| **Domain modules** | Real product capabilities (catalog, auth, orders, …) | `modules/<domain>/` | Nest API + app env |
| **Addon / availability gates** | Preview vs purchased feature switches | `modules/services/` | Optional `EXPO_PUBLIC_SERVICE_*` |

- Domain modules **implement** behavior (HTTP to Nest, UI).
- The **services registry** decides whether UI shows a control as `enabled` / `disabled` / `hidden`.
- Screens **never** branch on `process.env` for product availability — only on `getServiceStatus(id)`.

Detail for the gate layer: [services.md](./services.md).  
Env: [environment.md](./environment.md). Data: [database.md](./database.md).

---

## Recommended folder shape (mobile)

```text
sollution/apps/mobile/src/
  api/OrderBooking/            ← HTTP client + React Query (mirrors native-builder-frontend)
    client.ts
    queryClient.ts
    modules/
      user/ | branches/ | categories/ | products/ | orders/
  modules/
    services/                  ← addon registry
    auth/ | catalog/ | orders/ | profile/
```

Per API module: `[name].ts` (HTTP) · `[name]Hooks.ts` (React Query) · `[name].types.ts` · `index.ts`.

## Backend (Nest)

```text
sollution/apps/backend/
  ai_instruction/
    modules/<name>/        ↔ src/modules/<name> (module purpose + routes)
    features/stripe/       ← product feature: setup.md + modules that use Stripe
  src/modules/<name>/      ← Nest code
  src/shared/
```

Agent standards: [`ai_instruction/`](../sollution/apps/backend/ai_instruction/README.md).

---

## Contracts

| Concern | Rule |
|---------|------|
| Auth | Nest JWT — `POST /api/users/login` · `GET /api/users/me` |
| Catalog | `GET /api/branches` · `/categories` · `/products` |
| Orders | `GET|POST /api/orders` (Bearer) |
| Addon UI | `getServiceStatus` only |
| Secrets | Never in `EXPO_PUBLIC_*` / `VITE_*` |

---

## Related

- [services.md](./services.md) · [database.md](./database.md) · [overview.md](./overview.md)
