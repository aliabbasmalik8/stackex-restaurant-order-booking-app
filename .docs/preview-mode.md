# Preview mode

Optional one-time welcome on sign-in for customer preview builds.  
Keep it **minimal** — warn users; don’t fork app behavior.

Paths from **template root**. Separate from Firebase env keys and [services.md](./services.md).

---

## Enable

```bash
# sollution/apps/mobile/.env
EXPO_PUBLIC_PREVIEW_MODE=1
```

Helper: `sollution/apps/mobile/src/lib/previewMode.ts` → `isPreviewMode()`.

---

## What it does

| Piece | Behavior |
|-------|----------|
| **Welcome overlay** | Once on sign-in · ~5s + Skip · AsyncStorage `preview_welcome_shown` |
| **Copy** | Preview notice + ask users **not to enter real personal information** |

No dummy seeding, no edit locks, no order flags. App flows stay the same as production.

Feature availability (Apple, cards, etc.) stays on [services.md](./services.md) — unrelated.

---

## Code touchpoints

```text
lib/previewMode.ts
components/ui/PreviewWelcomeOverlay.tsx   # mounted on SignInScreen
i18n preview.*
```

---

## Profiles vs dashboard (always, not preview-specific)

| Collection | Owner (mobile) | Client admin |
|------------|----------------|--------------|
| `users/{uid}` | Own doc | **Denied** |
| `orders` | Own | **Allowed** |

Rules: `firebase/firestore.custom.rules`.

---

## Checklist

| Task | Action |
|------|--------|
| Preview env | `EXPO_PUBLIC_PREVIEW_MODE=1` |
| Production | leave unset |
| Welcome copy | i18n `preview.*` |
| Reset welcome on a device | clear app data / AsyncStorage key |

---

## Related

- [environment.md](./environment.md) · [services.md](./services.md) · [firebase.md](./firebase.md)
