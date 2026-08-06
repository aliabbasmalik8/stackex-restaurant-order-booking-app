# Profile module (Firestore `users/{uid}`)

Extended customer profile — contact phone + address.  
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
| email / displayName | Firebase Auth only |
| contactPhone | Firestore |
| address (`line1`, `city`, …) | Firestore flat fields on same doc |

- **Not seeded** — created on first save (Edit Profile or checkout phone).
- Rules: owner read/create/update on `users/{userId}` — apply `firebase/firestore.custom.rules` in Console.
- Collection: `COLLECTIONS.users` in `modules/catalog/constants.ts`.

`AuthContext` merges Auth + this doc into `profile`.
