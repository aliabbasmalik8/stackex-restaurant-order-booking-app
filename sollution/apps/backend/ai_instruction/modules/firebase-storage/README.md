# Module: `firebase-storage`

**Code:** [`src/modules/firebase-storage/`](../../../src/modules/firebase-storage/)

## What it’s for

Super-admin product image upload to Firebase Storage. Returns a download URL for `product.image`.

## Routes

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/firebase-storage/product-image` | super-admin (`multipart` field `file`) |

## Depends on

- `SharedModule` → `FirebaseAdminService` (`FIREBASE_*` + `FIREBASE_STORAGE_BUCKET`)

## Product features

- [Firebase Storage](../../features/firebase-storage/README.md) · [setup](../../features/firebase-storage/setup.md)
