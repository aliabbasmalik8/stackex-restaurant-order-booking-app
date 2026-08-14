# Feature area: auth

**Code:** `src/features/auth/` · **UI:** `src/feature-ui/auth/` · **HTTP:** `src/api/OrderBooking/modules/auth/`

Login / signup methods live in **one** auth feature folder (not separate google/password/phone packages).

## API routes (Nest `AuthModule`)

| Method | Path | Status |
|--------|------|--------|
| `POST` | `/api/auth/firebase` | **Preferred** |
| `POST` | `/api/auth/email-status` | Logged-out email: `ok` / `account-not-exist` / `password-reset-required` |
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

1. Email → `POST /api/auth/email-status`
   - `ok` → password field → Firebase `signInWithEmailAndPassword`
   - `account-not-exist` → error
   - `password-reset-required` → Firebase `sendPasswordResetEmail`, then sign in after they set a password
2. **Forgot password** (`/forgot-password`) — same Firebase reset email after email-status (no account → error)
3. Google sign-in on mobile (not Expo Go)
4. Firebase ID token → `POST /api/auth/firebase`
5. Nest verifies via Admin SDK, upserts `user.firebase_uid`, returns Nest JWTs
6. `setAuthSession` (same as before)

Native Google also needs `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.

**Expo Go:** the Google button stays enabled/disabled from feature flags. On press, native Expo Go shows `auth.errors.expo_go` and does not start OAuth (`exp://` is rejected by Google). Web and standalone/dev builds are unchanged.

## Sign-in methods (Profile)

Routes: `/sign-in-methods`, `/add-password`, `/change-password`.

Hooks in `src/core/auth/`:

| Helper | Purpose |
|--------|---------|
| `useSignInMethods()` | `email`, `hasPassword`, `isGoogleConnected`, `hasFirebaseSession`, `refresh()` |
| `addPasswordToAccount` / `changeAccountPassword` | Firebase `linkWithCredential` / reauth + `updatePassword` |
| `useConnectGoogle()` | Link Google onto the current Firebase user |

UI: `SignInMethodsScreen` shows email + Password **Add/Change** + Google **Connect/Connected**. Add/Change open their own screens. Google connects in place.

Firebase session is in-memory — after a cold start, Nest JWT may exist without `currentUser`. The screen then shows `profile.noFirebaseSession`.

## UI blocks

| Component | FeatureId |
|-----------|-----------|
| `PasswordLoginForm` / `CreateAccountPasswordForm` | `passwordAuth` |
| `PhoneLoginForm` / `CreateAccountPhoneForm` | `phoneAuth` |
| `GoogleAuthButton` / `AppleAuthButton` / `SocialLoginButtons` | `googleAuth` / `appleAuth` |
| `SignInMethodRow` / `PasswordField` | Profile sign-in methods |
