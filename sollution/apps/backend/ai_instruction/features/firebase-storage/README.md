# Feature: Firebase Storage

Upload product images to **Cloud Storage for Firebase** via the Nest Admin SDK.  
Admin feature-gates the upload UI; `product.image` still stores a plain HTTPS URL.

## Modules that use it

| Nest module | Role |
|-------------|------|
| [`firebase-storage`](../../modules/firebase-storage/README.md) | `POST /api/firebase-storage/product-image` |
| Shared `FirebaseAdminService` | Bucket upload + download-token URL |
| `product` | Unchanged — persists `image` string from admin |

Admin SPA: feature `firebaseStorage` (disabled by default) — see admin `ai_instruction/features/firebase-storage/`.

## Setup

→ **[setup.md](./setup.md)**
