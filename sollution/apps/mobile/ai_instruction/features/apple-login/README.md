# Feature: `appleLogin`

- **Priority `mode`:** `enabled` (when env OK)
- **Required env:** `EXPO_PUBLIC_SERVICE_APPLE_LOGIN`
- **Alternative:** yes (password login) → missing env ⇒ **hidden**
- UI: `SocialLoginButtons` — helpers only
- Keep injectable; core password login must work when this is off
