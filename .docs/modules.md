# Modules & addons (portable pattern)

How shippable apps under `sollution/` organize domain code and gate preview/customer **addons**.  
Copy this pattern into **other native-builder solutions** — swap domain names, keep the contracts.

Paths are from **template root**. Shippable code lives under `sollution/apps/<app>/src/modules/`.

---

## Two layers (do not confuse)

| Layer | What it is | Lives in | Env |
|-------|------------|----------|-----|
| **Domain modules** | Real product capabilities (catalog, auth, orders, …) | `modules/<domain>/` | Usually Firebase six-key contract only |
| **Addon / availability gates** | Preview vs purchased feature switches | `modules/services/` | Optional `EXPO_PUBLIC_SERVICE_*` |

- Domain modules **implement** behavior (Firestore, Auth, APIs).
- The **services registry** decides whether UI shows a control as `enabled` / `disabled` / `hidden`.
- Screens **never** branch on `process.env` for product availability — only on `getServiceStatus(id)`.

Detail for the gate layer: [services.md](./services.md).  
Firebase client keys stay separate: [environment.md](./environment.md).

---

## Recommended folder shape

```text
sollution/apps/<app>/src/
  modules/
    services/          ← addon registry (always copy this pattern)
      types.ts         # ServiceId · ServiceMode · ServiceDefinition
      registry.ts      # SERVICE_REGISTRY defaults + envEnableKey
      index.ts         # getServiceStatus · shouldRenderService · …
      README.md
    <domain>/          ← one folder per capability (auth, catalog, orders, …)
      api/ or *.ts     # pure I/O (no React when possible)
      hooks/           # React consumers
      components/      # domain UI only if shared across screens
      types.ts
      index.ts         # public exports
      README.md        # maps to firebase/ / providers / env
  screens/             ← route-level composition; gates via services helpers
  context/             ← app-wide session / cart (thin; call modules)
```

**Rules**

1. **One domain → one module.** Screens import from `@/modules/<domain>`, not the other way around.
2. **Services module has no product UI.** It only resolves availability.
3. **Firebase collection names** stay in one constants file (here: `modules/catalog/constants.ts`) and stay mapped to `firebase/` — [firebase.md](./firebase.md).
4. **Optional addons** get a `ServiceId` **before** they get deep UI — so preview can show `disabled` + reason.
5. Keep a short **module README** that points at seed/rules/env so the next template maintainer can remap.

---

## Addon lifecycle (preview → purchase)

```text
1. Add ServiceId + registry default (usually disabled or hidden)
2. Build UI that calls getServiceStatus / shouldRenderService / isServiceInteractive
3. Preview ships: control greyed or omitted
4. Customer buys → wire real provider / keys
5. Flip EXPO_PUBLIC_SERVICE_<NAME>=1 (or change registry default for that white-label)
6. UI becomes interactive — no screen rewrite
```

| Mode | Meaning for any solution |
|------|--------------------------|
| `enabled` | Wired and allowed |
| `disabled` | Visible, not interactive, show i18n reason |
| `hidden` | Do not render |

**Rule of thumb:** expected by users but unfinished → `disabled`; not part of the story yet → `hidden`.

---

## Adopt in another `sollution`

Checklist when starting or aligning a new template:

| Step | Action |
|------|--------|
| 1 | Copy `modules/services/` (`types` · `registry` · helpers). Clear `ServiceId` union to **that** product’s addons. |
| 2 | Add domain modules as needed (`auth`, `catalog`, …) with the same public-export + README habit. |
| 3 | Gate every unfinished control through `getServiceStatus` — never raw env in screens. |
| 4 | Document optional `EXPO_PUBLIC_SERVICE_*` in that template’s `.docs/services.md` + `.env.example` comments. |
| 5 | Keep Firebase six-key contract untouched unless main backend changes — [environment.md](./environment.md). |
| 6 | Link from template root `README.md` and `.docs/README.md` so discoverability matches this repo. |

**Do not** put Admin SDK, service accounts, or seed JSON inside `sollution/`. Those stay at template root (`firebase/`, `scripts/`).

---

## This template’s modules (example)

| Module | Role | Docs |
|--------|------|------|
| `services` | Addon / feature availability | [services.md](./services.md) · module README |
| `auth` | Password Auth + route/action gates | module README |
| `catalog` | Menu Firestore client | [firebase.md](./firebase.md) · module README |
| `orders` | Create + list owner orders (not seeded) | module README |

Folder map: [overview.md](./overview.md).

---

## Anti-patterns

| Avoid | Do instead |
|-------|------------|
| `if (process.env.EXPO_PUBLIC_SERVICE_*)` in screens | `getServiceStatus` / `isServiceInteractive` |
| Mixing seed Admin writes into the Expo app | `scripts/` + `firebase/seed-data.json` |
| One giant `utils/firebase.ts` for all domains | Domain modules with thin `lib/firebase.ts` |
| Treating addon env keys as required Firebase keys | Optional only — not part of the six-key contract |
| Shipping unfinished addons as `enabled` | `disabled` + reason, or `hidden` |

---

## Related

- Addon registry detail + this app’s `ServiceId` catalog: [services.md](./services.md)
- Env contracts: [environment.md](./environment.md)
- Repo split / mapping: [overview.md](./overview.md)
- Shippable module READMEs: `sollution/apps/mobile/src/modules/*/README.md`
