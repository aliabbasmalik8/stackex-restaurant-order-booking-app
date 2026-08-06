# Maintaining this template

Docs for people who **maintain this repo** (Stackex / native-builder). Not product UI docs for restaurant guests.

`.docs/` lives at **template root** (next to `sollution/`, `firebase/`, `scripts/`) — it is **not** part of the shippable solution. Shippable code is `sollution/apps/` + `sollution/shared/` only.

| Doc | Contents |
|-----|----------|
| [overview.md](./overview.md) | Repo purpose · `sollution/` vs the rest · folder / collection / env map |
| [modules.md](./modules.md) | **Portable** modules + addons pattern — adapt in other solutions |
| [services.md](./services.md) | Addon registry (`enabled` / `disabled` / `hidden`) · this app’s catalog |
| [environment.md](./environment.md) | Six `EXPO_PUBLIC_FIREBASE_*` keys · main backend contract |
| [preview-mode.md](./preview-mode.md) | `EXPO_PUBLIC_PREVIEW_MODE` · one-time welcome + PII warning |
| [firebase.md](./firebase.md) | Keep `firebase/` ↔ catalog module mapped |

## Sibling docs

| Doc | Audience |
|-----|----------|
| [../README.md](../README.md) | Template root index |
| [../sollution/README.md](../sollution/README.md) | Solution (app) README — screens, theme, i18n |
| [../firebase/README.md](../firebase/README.md) | Preview-backend file meanings |
| [../scripts/README.md](../scripts/README.md) | Local Admin tooling |

Update **this folder + sibling READMEs** in the same PR when env keys, collections, seed shape, or folder roles change.
