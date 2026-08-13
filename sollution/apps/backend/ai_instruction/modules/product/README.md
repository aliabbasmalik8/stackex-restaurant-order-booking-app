# Module: `product`

**Code:** [`src/modules/product/`](../../../src/modules/product/)

## What it’s for

Brand-level menu products (not tied to a branch) — public read; super-admin manage/CRUD.

## Routes

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/products` | public |
| `GET` | `/api/products/manage` | super-admin |
| `GET` | `/api/products/:id` | public |
| `POST` / `PATCH` / `DELETE` | `/api/products`… | super-admin |

## Depends on

- Entity `Product`, `CategoryDbService` (`@database/services`)

## Product features

- Image upload (optional): [Firebase Storage](../../features/firebase-storage/README.md) — admin stores returned URL on `image`; product module unchanged.
