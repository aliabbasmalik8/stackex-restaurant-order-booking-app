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

## Recommended folder shape (client apps)

```text
sollution/apps/<app>/src/
  modules/
    services/          ← addon registry (always copy this pattern)
      types.ts
      registry.ts
      index.ts
    <domain>/          ← auth, catalog, orders, …
      api/ or *.ts
      hooks/
      types.ts
      index.ts
```

## Backend (Nest)

```text
sollution/apps/backend/src/
  modules/
    user/              ← signup · login · me
    health/
  database/
    entities/          ← User · Category · Product
    services/          ← *-db.service.ts
  shared/              ← AuthService · AuthGuard · Redis (Nest shared, not @repo/shared)
```

---

## Contracts

| Concern | Rule |
|---------|------|
| Auth | Nest JWT + Redis sessions — `POST /api/users/login` · `GET /api/users/me` |
| Catalog data | Postgres `category` / `product` — seed via `scripts/` |
| Addon UI | `getServiceStatus` only |
| Secrets | Never in `EXPO_PUBLIC_*` / `VITE_*` |

---

## Related

- [services.md](./services.md) · [database.md](./database.md) · [overview.md](./overview.md)
