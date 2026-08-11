# Module: `category`

**Code:** [`src/modules/category/`](../../../src/modules/category/)

## What it’s for

Menu categories — public read; super-admin write.

## Routes

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/categories` | public |
| `GET` | `/api/categories/:id` | public |
| `POST` / `PATCH` / `DELETE` | `/api/categories`… | super-admin |

## Depends on

- `SharedModule`, entity `Category`

## Product features

None.
