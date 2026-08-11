# Feature: `notifications`

Default: **disabled**. Push / in-app notification entry points.

- Env: `EXPO_PUBLIC_SERVICE_NOTIFICATIONS=1`
- Registry: `notifications`
- Gate profile / settings rows with `isServiceInteractive('notifications')`
- Implement as an injectable module; app must run fine when hidden/disabled
