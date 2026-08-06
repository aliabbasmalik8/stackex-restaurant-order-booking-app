# Services / preview feature availability

Mental model for capabilities that are **not ready in the preview template** (Apple/Google login, future payments, addons, etc.) until a customer buys the app and AI / maintainers add real config.

Shippable code: `sollution/apps/mobile/src/modules/services/`.

## Why a module (not raw env in UI)

| Layer | Responsibility |
|-------|----------------|
| **Registry** (`registry.ts`) | Service ids, default `mode`, reason i18n key, optional env enable key |
| **Helpers** (`getServiceStatus`, …) | Resolve effective mode; UI only asks these |
| **Optional env** | Customer / AI flips `EXPO_PUBLIC_SERVICE_*=1` after wiring providers |
| **Screens** | Never `if (process.env…)` for product availability |

Firebase’s six `EXPO_PUBLIC_FIREBASE_*` keys stay a **separate** main-backend contract ([environment.md](./environment.md)). Service toggles are **optional** and not required for preview provisioning.

## Modes (default behavior)

| Mode | UI meaning | When to use |
|------|------------|-------------|
| `enabled` | Normal, interactive | Wired and allowed in this build |
| `disabled` | Visible, greyed, show reason | Expected by users but not in preview yet (e.g. Apple / Google) |
| `hidden` | Do not render | Not part of the product story yet (or would clutter UI) |

**Preview rule of thumb:** show what customers expect → `disabled` + reason; omit unfinished addons → `hidden`.

## Resolution order

```text
1. Registry default `mode`
2. If envEnableKey is "1" / "true" / "yes" → effective `enabled`
3. UI reads getServiceStatus(id) only
```

## Current catalog (defaults)

| Service id | Default mode | Env override | Notes |
|------------|--------------|--------------|--------|
| `passwordLogin` | enabled | — | Firebase email/password sign-in (`modules/auth`) |
| `phoneLogin` | hidden | `EXPO_PUBLIC_SERVICE_PHONE_LOGIN` | Sign-in OTP — `PhoneLoginForm` kept |
| `createAccountPassword` | enabled | — | Firebase email/password sign-up |
| `createAccountPhone` | hidden | `EXPO_PUBLIC_SERVICE_CREATE_ACCOUNT_PHONE` | Sign-up OTP — `CreateAccountPhoneForm` kept |
| `continueAsGuest` | enabled | — | Browse without Firebase user |
| `appleLogin` | disabled | `EXPO_PUBLIC_SERVICE_APPLE_LOGIN` | Reason: `services.previewUnavailable` |
| `googleLogin` | disabled | `EXPO_PUBLIC_SERVICE_GOOGLE_LOGIN` | Same |

Auth UI composition under `sollution/apps/mobile/src/screens/auth/components/`:

| Screen | Modules |
|--------|---------|
| Sign in | `PasswordLoginForm` · `PhoneLoginForm` · `SocialLoginButtons` |
| Create account | `CreateAccountPasswordForm` · `CreateAccountPhoneForm` |

Password Auth API: `sollution/apps/mobile/src/modules/auth/` (`signInWithPassword` / `signUpWithPassword` / `signOutUser`).  
Session: `AuthContext` + `onAuthStateChanged` (AsyncStorage persistence). Enable **Email/Password** in Firebase Console → Authentication → Sign-in method.

Add future addons (payments, delivery, loyalty, …) as new `ServiceId` entries in the registry — same modes / helpers.

## Customer purchase / AI enable path

1. Add real provider config (native keys, OAuth client ids, etc.).
2. Set the matching `EXPO_PUBLIC_SERVICE_*=1` in the customer env (or change registry default to `enabled` for that white-label).
3. UI lights up without rewriting screens.

Do **not** treat service env keys as part of the Firebase six-key backend list unless the main backend explicitly starts injecting them.

## Maintainer checklist

| Change | Update |
|--------|--------|
| New gated feature / addon | `ServiceId` + `SERVICE_REGISTRY` + screen uses helpers |
| New unavailable copy | i18n `services.*` + `unavailableReasonKey` |
| New env enable flag | `envEnableKey` on definition + comment in `.env.example` + this doc |
| Hide whole social block | set both social services to `hidden` (Sign In already hides the block) |

## Related

- Module README: `sollution/apps/mobile/src/modules/services/README.md`
- Env (Firebase contract): [environment.md](./environment.md)
- Overview map: [overview.md](./overview.md)
