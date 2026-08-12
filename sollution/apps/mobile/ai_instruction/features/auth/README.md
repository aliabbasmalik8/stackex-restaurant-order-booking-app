# Feature area: auth

**Code:** `src/features/auth/` · **UI:** `src/feature-ui/auth/` · **HTTP:** `src/api/OrderBooking/modules/auth/`

Login / signup methods live in **one** auth feature folder (not separate google/password/phone packages).

## API routes (Nest `AuthModule`)

| Method | Path | Status |
|--------|------|--------|
| `POST` | `/api/auth/firebase` | **Preferred** |
| `POST` | `/api/auth/signup` | **Deprecated** — remove later |
| `POST` | `/api/auth/login` | **Deprecated** — remove later (admin temporary) |

Profile remains on **user**: `GET/PATCH /api/users/me`.

Guest mobile auth (password + Google) uses **Firebase →** `POST /api/auth/firebase` → Nest JWTs.

Nest-local `/login` + `/signup`, mobile `authApi.login` / `signup`, `useLogin` / `useSignup`, and `user.password` are **deprecated** and planned for removal once admin also uses Firebase.

## Method gates (`FeatureId`)

| Id | Priority `mode` | Required env | Missing env |
|----|-----------------|--------------|-------------|
| `passwordAuth` | enabled | Firebase client keys | **disabled** (visible) |
| `phoneAuth` | hidden | — | hidden |
| `googleAuth` | enabled | `EXPO_PUBLIC_FEATURE_GOOGLE_AUTH` + Firebase keys | **disabled** if missing; native also needs Google web client id |
| `appleAuth` | enabled | `EXPO_PUBLIC_FEATURE_APPLE_AUTH` | **disabled** (visible) |

Always on (not a FeatureId): continue as guest.

```ts
import { shouldRenderPasswordAuth } from '@/features/auth';
import { PasswordLoginForm, SocialLoginButtons } from '@/feature-ui/auth';
import { authApi } from '@/api/OrderBooking/modules/auth';
import { useGoogleSignIn } from '@/core/auth';
```

## Password + Google flow

1. Firebase email/password or Google sign-in on mobile
2. Firebase ID token → `POST /api/auth/firebase`
3. Nest verifies via Admin SDK, upserts `user.firebase_uid`, returns Nest JWTs
4. `setAuthSession` (same as before)

Native Google also needs `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.

## UI blocks

| Component | FeatureId |
|-----------|-----------|
| `PasswordLoginForm` / `CreateAccountPasswordForm` | `passwordAuth` |
| `PhoneLoginForm` / `CreateAccountPhoneForm` | `phoneAuth` |
| `GoogleAuthButton` / `AppleAuthButton` / `SocialLoginButtons` | `googleAuth` / `appleAuth` |
