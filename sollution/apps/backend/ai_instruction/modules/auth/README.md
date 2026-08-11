# Module: `auth`

**Code:** [`src/modules/auth/`](../../../src/modules/auth/)

Login / signup HTTP. Profile (`/users/me`) stays on the **user** module.

## Routes

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/auth/signup` | public |
| `POST` | `/api/auth/login` | public |

## Files

| File | Role |
|------|------|
| `auth.module.ts` | Nest module |
| `auth.controller.ts` | Routes |
| `auth.service.ts` | Signup / login + tokens |
| `auth.dto.ts` | Login / signup / auth response DTOs |

## Deps

- `UserDbService` — create / find by email
- `@shared` `AuthService` — hash + JWT

## Product features

Password auth today. Social / phone OTP can plug into this module later without splitting Nest folders per method.
