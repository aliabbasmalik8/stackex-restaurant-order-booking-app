# Maintaining this template

Docs for people who **maintain this repo** (Stackex / native-builder). Not product UI docs for restaurant guests.

`.docs/` lives at **template root** (next to `sollution/`, `scripts/`) — **not** part of the shippable solution.

| Doc | Contents |
|-----|----------|
| [overview.md](./overview.md) | Repo purpose · `sollution/` vs the rest · folder / table / env map |
| [howto-setup-local.md](./howto-setup-local.md) | Local Postgres + Nest + seed + mobile |
| [database.md](./database.md) | TypeORM entities · migrations · seed mapping |
| [modules.md](./modules.md) | Portable modules + React Query API pattern |
| [services.md](./services.md) | Addon registry (`enabled` / `disabled` / `hidden`) |
| [environment.md](./environment.md) | Backend + scripts + mobile env |
| [preview-mode.md](./preview-mode.md) | `EXPO_PUBLIC_PREVIEW_MODE` · one-time welcome |

## Sibling docs

| Doc | Audience |
|-----|----------|
| [../README.md](../README.md) | Template root index |
| [../sollution/README.md](../sollution/README.md) | Solution README |
| [../sollution/apps/backend/README.md](../sollution/apps/backend/README.md) | Nest API |
| [../scripts/README.md](../scripts/README.md) | Postgres seed / create-admin |

Update **this folder + sibling READMEs** in the same PR when env keys, schema, seed shape, or folder roles change.
