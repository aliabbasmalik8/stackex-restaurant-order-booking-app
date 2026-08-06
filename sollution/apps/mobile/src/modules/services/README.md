# Services module (preview feature availability)

Gates UI for capabilities that may be **unavailable in preview** until a customer
buys the app and AI / maintainers add real config (env, native keys, providers).

```text
modules/services/
  types.ts      # ServiceId, ServiceMode, definitions
  registry.ts   # Catalog + defaults
  index.ts      # getServiceStatus, isServiceEnabled, …
```

## Modes

| Mode | UI |
|------|-----|
| `enabled` | Normal control |
| `disabled` | Visible, non-interactive, show reason |
| `hidden` | Do not render |

## Usage

```tsx
import {
  getServiceStatus,
  isServiceEnabled,
  shouldRenderService,
} from '@/modules/services';

const apple = getServiceStatus('appleLogin');
if (shouldRenderService('appleLogin')) {
  <Button disabled={!isServiceEnabled('appleLogin')} … />
  {apple.reasonKey ? t(apple.reasonKey) : null}
}
```

Auth forms live under `screens/auth/components/` and gate on:

| Service | Form |
|---------|------|
| `passwordLogin` / `phoneLogin` | `PasswordLoginForm` / `PhoneLoginForm` |
| `createAccountPassword` / `createAccountPhone` | `CreateAccountPasswordForm` / `CreateAccountPhoneForm` |

Do **not** read `process.env` in screens for these decisions.

Profile also gates `paymentMethods`, `notifications`, and `helpSupport` (all
`disabled` in preview).

Optional enable overrides (not Firebase keys): see template `.docs/services.md`.
