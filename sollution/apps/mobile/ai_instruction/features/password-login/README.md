# Feature: `passwordLogin`

Default: **enabled**. Core email/password sign-in.

- Registry: `SERVICE_REGISTRY.passwordLogin`
- UI: auth screens / `PasswordLoginForm` — gate with `isServiceInteractive('passwordLogin')`
- API: `POST /api/users/login` via OrderBooking user client

No env flag (always on unless you change the registry default).
