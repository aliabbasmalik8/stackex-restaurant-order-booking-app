# Environment contract (main backend)

## Why this is restricted

When the **main backend** provisions a Firebase-backed customer preview, it injects a **fixed** set of Expo public env vars into the mobile app.

`sollution/apps/mobile` must use **only** those names. Do not invent, rename, nest, or add Firebase client env keys in this solution unless the main backend is updated to provision them too — otherwise previews ship without the value.

Same convention as order-desk mobile. `NEXT_PUBLIC_FIREBASE_*` is for Next admin apps elsewhere — **not** this Expo app.

## Allowed keys (only these)

```ts
const FIREBASE_ENV_VAR_KEYS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const;
```

| Source of truth | Path (from template root) |
|-----------------|---------------------------|
| App code | `sollution/apps/mobile/src/lib/firebaseEnv.ts` |
| Example file | `sollution/apps/mobile/.env.example` (empty values only — commit this) |
| Local secrets | `sollution/apps/mobile/.env` (gitignored — never commit) |

Admin / service-account secrets stay under `scripts/` — never as `EXPO_PUBLIC_*`.

### Maintainer checklist (keep the backend standard)

| Change | Action |
|--------|--------|
| Rename / remove a key | Coordinate with **main backend** + update `firebaseEnv.ts` + `.env.example` + this doc |
| Add a 7th Firebase client key | **Blocked** until main backend supports injecting it |
| Local-only tooling secrets | `scripts/.env` only — not the mobile app |
| Preview provisioning | Backend writes these six into the preview env — app must already read them |

## How to fill local `.env` (manual)

Local project: `restaurent-order-app-local`  
Console: https://console.firebase.google.com/project/restaurent-order-app-local/overview

1. Open Firebase Console → **Project settings** (gear) → **Your apps**.
2. Select (or create) a **Web** app — copy the Firebase SDK config object.
3. From template root:

```bash
cd sollution/apps/mobile
cp .env.example .env
```

4. Map Console fields → env keys (same names the main backend uses):

| Firebase Console / SDK field | `.env` key |
|------------------------------|------------|
| `apiKey` | `EXPO_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `EXPO_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `EXPO_PUBLIC_FIREBASE_APP_ID` |

5. Restart Expo (`pnpm start`) after editing `.env`.

Do not add other Firebase keys to this file. Preview environments get the same six from the main backend automatically.

## Related

- Folder / env map: [overview.md](./overview.md)
- Schema / seed: [firebase.md](./firebase.md)
