# Module: `auth`

**Code:** [`src/modules/auth/`](../../../src/modules/auth/)

Login / signup HTTP. Profile (`/users/me`) stays on the **user** module.

## Routes

| Method | Path | Auth | Status |
|--------|------|------|--------|
| `POST` | `/api/auth/firebase` | public | **Preferred** — Firebase ID token → Nest JWT |
| `POST` | `/api/auth/signup` | public | **Deprecated** — remove later |
| `POST` | `/api/auth/login` | public | **Deprecated** — remove later (admin still uses temporarily) |

## Files

| File | Role |
|------|------|
| `auth.module.ts` | Nest module |
| `auth.controller.ts` | Routes |
| `auth.service.ts` | Signup / login / Firebase exchange + tokens |
| `auth.dto.ts` | Login / signup / Firebase / auth response DTOs |

## Deps

- `UserDbService` — create / find by email / firebase uid
- `@shared` `AuthService` — hash + JWT (hash helpers only for deprecated Nest password paths)
- `@shared` `FirebaseAdminService` — verify Firebase ID tokens

## Product features

- **Preferred:** Firebase (email/password, Google, Apple, …) → verify ID token → upsert user → Nest JWT via `POST /auth/firebase`
- **Deprecated:** Nest-local email/password `POST /auth/login` + `/auth/signup` and `user.password` — kept for admin / legacy until Firebase covers them; planned removal

Firebase Admin env: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (see `firebase/.env.example`).  
Storage uploads also need `FIREBASE_STORAGE_BUCKET` — [firebase-storage setup](../../features/firebase-storage/setup.md).
