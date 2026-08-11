# Feature: `phoneLogin`

Default: **hidden**. OTP / phone sign-in (keep UI code; hide until enabled).

- Env: `EXPO_PUBLIC_SERVICE_PHONE_LOGIN=1`
- Registry: `phoneLogin`
- Gate: `shouldRenderService` / `isServiceInteractive('phoneLogin')`
