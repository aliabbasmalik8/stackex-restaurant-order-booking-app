# Features (injectable + env-gated)

**Code:** `src/features/_registry/` · UI: `src/feature-ui/`

**Not features (always on):** continue as guest, cash payment.

## Resolution

```text
required env missing → hidden if alternativeAvailable else disabled
env OK               → registry mode
```

Never read `import.meta.env.VITE_FEATURE_*` in screens.

## Catalog

| Feature id | Priority `mode` | Required env | Alt → hide if missing? | Doc |
|------------|-----------------|--------------|------------------------|-----|
| `passwordAuth` | enabled | Firebase client keys | no (disabled) | [auth](./auth/README.md) |
| `phoneAuth` | hidden | — | — | [auth](./auth/README.md) |
| `googleAuth` | enabled | `VITE_FEATURE_GOOGLE_AUTH` + Firebase keys | no (disabled) | [auth](./auth/README.md) |
| `appleAuth` | enabled | `VITE_FEATURE_APPLE_AUTH` | no (disabled) | [auth](./auth/README.md) |
| `stripePayment` | enabled | `VITE_STRIPE_PUBLISHABLE_KEY` | yes (cash) | not wired yet |

## Always on

| Concern | Notes |
|---------|-------|
| Continue as guest | Sign-in footer |
| Cash payment | Checkout later |
