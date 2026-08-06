# Profile module (Firestore `users/{uid}`)

Extended customer profile — display name, contact phone, address.  
Doc id = Firebase Auth uid.

```text
modules/profile/
  types.ts
  api.ts          # fetchUserProfile / saveUserProfile
  index.ts
```

## Source of truth

| Field | Source |
|-------|--------|
| email | Firebase Auth only (never written to Firestore) |
| displayName | Firestore + mirrored to Auth on save |
| contactPhone | Firestore only (not Auth `phoneNumber`) |
| address | Firestore only |

- **Not seeded** — created on first save from Edit Profile.
- Rules: owner read/create/update on `users/{userId}` — see `firebase/firestore.custom.rules` (must be applied in Console).
- Collection: `COLLECTIONS.users` in `modules/catalog/constants.ts`.

`AuthContext` merges Auth + this doc into `profile` (including `address`).
