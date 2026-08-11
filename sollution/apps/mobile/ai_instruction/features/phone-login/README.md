# Feature: `phoneLogin`

- **Priority `mode`:** `enabled` (when env OK)
- **Required env:** `EXPO_PUBLIC_SERVICE_PHONE_LOGIN`
- **Alternative:** yes → missing env ⇒ **hidden**
- Gate: `shouldRenderService` / `isServiceInteractive('phoneLogin')`
