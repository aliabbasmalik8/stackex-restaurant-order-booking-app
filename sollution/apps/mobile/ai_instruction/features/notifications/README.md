# Feature: `notifications`

- **Priority `mode`:** `enabled` (when env OK)
- **Required env:** `EXPO_PUBLIC_SERVICE_NOTIFICATIONS`
- **Alternative:** no → missing env ⇒ **disabled** (row visible, not usable)
- Gate: `isServiceInteractive('notifications')`
