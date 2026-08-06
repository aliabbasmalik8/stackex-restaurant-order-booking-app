# Services registry (addon / feature gates)

**Portable pattern first:** [modules.md](./modules.md) — modules vs addons, folder shape, how other solutions adopt.

This doc is the **gate layer**: `sollution/apps/mobile/src/modules/services/` — when a control is `enabled` / `disabled` / `hidden` in preview until a customer buys and AI / maintainers wire real config.

---

## Contract (copy into other solutions)

| Piece | Responsibility |
|-------|----------------|
| `types.ts` | `ServiceId` union · `ServiceMode` · `ServiceDefinition` |
| `registry.ts` | Default `mode`, optional `unavailableReasonKey`, optional `envEnableKey` |
| `index.ts` helpers | `getServiceStatus` · `shouldRenderService` · `isServiceInteractive` · … |
| Screens / forms | Call helpers only — **never** raw `process.env` for availability |
| i18n | Reason strings under `services.*` (or product-equivalent namespace) |

Firebase’s six `EXPO_PUBLIC_FIREBASE_*` keys are a **separate** main-backend contract ([environment.md](./environment.md)).  
`EXPO_PUBLIC_SERVICE_*` toggles are **optional** and not required for preview provisioning.

### Modes

| Mode | UI meaning | When to use |
|------|------------|-------------|
| `enabled` | Normal, interactive | Wired and allowed in this build |
| `disabled` | Visible, greyed, show reason | Expected by users but not ready yet |
| `hidden` | Do not render | Not part of the product story (or would clutter) |

### Resolution order

```text
1. Registry default `mode`
2. If envEnableKey is "1" / "true" / "yes" → effective `enabled`
3. UI reads getServiceStatus(id) only
```

### Customer purchase / AI enable path

1. Add real provider config (native keys, OAuth client ids, payments, …).
2. Set matching `EXPO_PUBLIC_SERVICE_*=1` (or change registry default for that white-label).
3. UI lights up without rewriting screens.

---

## This template’s catalog (defaults)

| Service id | Default mode | Env override | Notes |
|------------|--------------|--------------|--------|
| `passwordLogin` | enabled | — | Firebase email/password (`modules/auth`) |
| `phoneLogin` | hidden | `EXPO_PUBLIC_SERVICE_PHONE_LOGIN` | OTP UI kept |
| `createAccountPassword` | enabled | — | Firebase email/password sign-up |
| `createAccountPhone` | hidden | `EXPO_PUBLIC_SERVICE_CREATE_ACCOUNT_PHONE` | OTP UI kept |
| `continueAsGuest` | enabled | — | Browse without Firebase user |
| `appleLogin` | disabled | `EXPO_PUBLIC_SERVICE_APPLE_LOGIN` | `services.previewUnavailable` |
| `googleLogin` | disabled | `EXPO_PUBLIC_SERVICE_GOOGLE_LOGIN` | Same |
| `paymentMethods` | disabled | `EXPO_PUBLIC_SERVICE_PAYMENT_METHODS` | Profile row |
| `notifications` | disabled | `EXPO_PUBLIC_SERVICE_NOTIFICATIONS` | Profile toggle |
| `helpSupport` | disabled | `EXPO_PUBLIC_SERVICE_HELP_SUPPORT` | Profile row |

Auth UI under `sollution/apps/mobile/src/screens/auth/components/`:

| Screen | Gated pieces |
|--------|----------------|
| Sign in | `PasswordLoginForm` · `PhoneLoginForm` · `SocialLoginButtons` |
| Create account | `CreateAccountPasswordForm` · `CreateAccountPhoneForm` |

Auth API / session: `modules/auth` + `AuthContext`. Enable **Email/Password** in Firebase Console.

### Auth route / action gates (this app)

| Hook / UI | Use |
|-----------|-----|
| `useAuthAction(redirectTo?)` | Tap / tab — prevent forward + **login modal** |
| `useRequireAuthScreen({ redirectTo? })` | Already on protected route — `string` → sign-in `/`; omit/`null` → `AuthRequiredView` |
| `AuthRequiredView` | Guest placeholder + go home |

These are **auth UX**, not `ServiceId`s — keep them in `modules/auth`. New product addons still go in the services registry.

---

## Maintainer checklist (any solution)

| Change | Update |
|--------|--------|
| New gated addon | `ServiceId` + `SERVICE_REGISTRY` + UI uses helpers |
| New unavailable copy | i18n reason key + `unavailableReasonKey` |
| New env enable flag | `envEnableKey` + `.env.example` comment + this doc |
| Port pattern to another template | Follow [modules.md](./modules.md) “Adopt in another sollution” |

---

## Related

- Portable modules / addons: [modules.md](./modules.md)
- Module README: `sollution/apps/mobile/src/modules/services/README.md`
- Env (Firebase contract): [environment.md](./environment.md)
- Overview map: [overview.md](./overview.md)
