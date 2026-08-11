# Feature: `appleLogin`

Default: **disabled** (shown but not usable until env on).

- Env: `EXPO_PUBLIC_SERVICE_APPLE_LOGIN=1`
- Registry: `appleLogin`
- UI: `SocialLoginButtons` — `isServiceInteractive('appleLogin')`
- Implement as an injectable social auth path; do not hard-require for core login.
