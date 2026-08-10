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
| i18n | Reason strings under `services.*` |

Backend auth/API env is separate ([environment.md](./environment.md)).  
`EXPO_PUBLIC_SERVICE_*` toggles are **optional** and not required for API provisioning.

### Modes

| Mode | UI meaning | When to use |
|------|------------|-------------|
| `enabled` | Normal, interactive | Wired and allowed in this build |
| `disabled` | Visible, greyed, show reason | Expected by users but not ready yet |
| `hidden` | Do not render | Not part of the product story |

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
| `passwordLogin` | enabled | — | Nest email/password (`/api/users/login`) |
| `appleLogin` | disabled / gated | `EXPO_PUBLIC_SERVICE_APPLE_LOGIN` | Wire when purchased |
| `googleLogin` | disabled / gated | `EXPO_PUBLIC_SERVICE_GOOGLE_LOGIN` | Wire when purchased |

(Exact registry entries live in `sollution/apps/mobile/src/modules/services/registry.ts`.)

---

## Related

- [modules.md](./modules.md) · [environment.md](./environment.md) · [preview-mode.md](./preview-mode.md)
