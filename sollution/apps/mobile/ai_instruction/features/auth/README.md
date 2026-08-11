# Feature area: auth

**Code:** `src/features/auth/` · **UI:** `src/feature-ui/auth/` · **HTTP:** `src/api/OrderBooking/modules/auth/`

Login / signup methods live in **one** auth feature folder (not separate google/password/phone packages).

## API routes (Nest `AuthModule`)

| Method | Path |
|--------|------|
| `POST` | `/api/auth/signup` |
| `POST` | `/api/auth/login` |

Profile remains on **user**: `GET/PATCH /api/users/me`.

## Method gates (`FeatureId`)

| Id | Priority `mode` | Required env | Notes |
|----|-----------------|--------------|-------|
| `passwordAuth` | enabled | — | Email + password login & signup |
| `phoneAuth` | hidden | — | OTP — hidden until wired |
| `googleAuth` | enabled | `EXPO_PUBLIC_FEATURE_GOOGLE_AUTH` | Hidden if env missing |
| `appleAuth` | enabled | `EXPO_PUBLIC_FEATURE_APPLE_AUTH` | Hidden if env missing |

Always on (not a FeatureId): continue as guest.

```ts
import { shouldRenderPasswordAuth } from '@/features/auth';
import { PasswordLoginForm, SocialLoginButtons } from '@/feature-ui/auth';
import { authApi } from '@/api/OrderBooking/modules/auth';
```

## UI blocks

| Component | FeatureId |
|-----------|-----------|
| `PasswordLoginForm` / `CreateAccountPasswordForm` | `passwordAuth` |
| `PhoneLoginForm` / `CreateAccountPhoneForm` | `phoneAuth` |
| `GoogleAuthButton` / `AppleAuthButton` / `SocialLoginButtons` | `googleAuth` / `appleAuth` |
