# Feature: Firebase Storage (admin)

Product image **upload** via Nest → Firebase Admin Storage.  
Manual image URL stays available always.

**Code**

| Layer | Path |
|-------|------|
| Registry | `src/features/_registry` (`firebaseStorage`) |
| Feature API | `src/features/firebase-storage/` |
| HTTP | `src/api/OrderBooking/modules/firebase-storage/` |
| UI | `src/components/products/ProductImageField.tsx` |
| Backend | `apps/backend` module `firebase-storage` |

## Enable (per white-label deploy)

1. Firebase project on **Blaze** + Storage bucket created  
2. Backend env: Admin credentials + `FIREBASE_STORAGE_BUCKET` — see backend [setup](../../../backend/ai_instruction/features/firebase-storage/setup.md)  
3. Admin `.env`: `VITE_FEATURE_FIREBASE_STORAGE=1`  
4. Flip registry mode to **`enabled`** in `src/features/_registry/registry.ts`:

```ts
firebaseStorage: {
  id: 'firebaseStorage',
  mode: 'enabled', // was 'disabled'
  requiredEnvKeys: ['VITE_FEATURE_FIREBASE_STORAGE'],
  alternativeAvailable: true,
  unavailableReasonKey: 'features.firebaseStorageUnavailable',
},
```

5. Apply Storage rules from repo root [`firebase/storage.rules`](../../../../../../firebase/storage.rules) (deny client read/write; Admin SDK uploads still work).

Until both env + `mode: 'enabled'` are set, the upload control stays **hidden**; paste URL still works.

## Flow

```text
Admin picks file
  → features/firebase-storage uploadProductImage
  → POST /api/firebase-storage/product-image (super-admin JWT)
  → Nest uploads to Storage
  → { url } written into product form `image`
  → save product as usual
```

## Related

- Backend feature: [`../../../backend/ai_instruction/features/firebase-storage/`](../../../backend/ai_instruction/features/firebase-storage/)
- Registry rules: [../README.md](../README.md)
