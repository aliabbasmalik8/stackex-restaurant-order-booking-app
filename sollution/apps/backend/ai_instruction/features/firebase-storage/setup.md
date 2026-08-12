# Firebase Storage — setup (white-label)

One deploy = one restaurant Firebase project (same pattern as Auth / Stripe).

## Prerequisites

1. Firebase project on the **Blaze** plan (Storage requires billing; free quota still applies)  
2. Create a default Storage bucket in the Firebase console  
3. Set a **Google Cloud budget alert** (budgets alert — they do not auto-cut off)

## Backend env (`apps/backend/.env`)

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-…@….iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n…\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
# or: your-project.firebasestorage.app
```

Keys: `firebase/.env.example`. Never put private keys in the admin SPA.

Without `FIREBASE_STORAGE_BUCKET`, upload returns **503** (manual URL still works in admin).

## Admin env (`apps/admin/.env`)

```bash
VITE_FEATURE_FIREBASE_STORAGE=1
```

And set registry `firebaseStorage.mode` to **`enabled`** (ships as `disabled`).

## API

| Method | Path | Auth | Body |
|--------|------|------|------|
| `POST` | `/api/firebase-storage/product-image` | super-admin | `multipart/form-data` field `file` |

**Response:** `{ url: string, objectPath: string }`

Limits: JPEG / PNG / WebP / GIF · max **5 MB**. Objects stored under `products/<uuid>.<ext>`.

## Security notes

- Upload is **server-side** (Admin SDK) — admin uses Nest JWT, not Firebase Auth rules for writes.  
- Returned URL embeds a Firebase download token (readable without signing in).  
- Client SDK access is denied by default — copy [`firebase/storage.rules`](../../../../../../firebase/storage.rules) into Firebase Console → Storage → Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```
