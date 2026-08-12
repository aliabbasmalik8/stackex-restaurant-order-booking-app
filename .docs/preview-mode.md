# Preview mode

Optional env flags for customer **preview** deployments. Paths from **template root**.

---

## Mobile — welcome notice

```bash
# sollution/apps/mobile/.env
EXPO_PUBLIC_PREVIEW_MODE=1
```

Helper: `sollution/apps/mobile/src/lib/previewMode.ts` → `isPreviewMode()`.

| Piece | Behavior |
|-------|----------|
| **Welcome overlay** | Once on sign-in · ~5–10s + Skip · AsyncStorage `preview_welcome_shown` |
| **Copy** | Preview notice + ask users **not to enter real personal information** |

No dummy seeding. App flows stay the same as production. Feature gates: [services.md](./services.md).

---

## Admin — keep store open (UI only)

```bash
# sollution/apps/admin/.env  (Vite requires VITE_ prefix)
VITE_IS_PUBLIC_PREVIEW_MODE=1
```

Admin-only env — not a DB setting, not enforced by the API.

| Piece | Behavior |
|-------|----------|
| **Admin UI** | Store availability checkbox cannot be turned off |

Helper: `sollution/apps/admin/src/lib/previewMode.ts` → `isPublicPreviewMode()`

Truthy values: `1` · `true` · `yes`. Leave unset in production.

---

## Checklist

| Task | Action |
|------|--------|
| Mobile welcome | `EXPO_PUBLIC_PREVIEW_MODE=1` |
| Admin store lock | `VITE_IS_PUBLIC_PREVIEW_MODE=1` |
| Production | leave unset |
| Reset mobile welcome | clear app data / AsyncStorage key |

---

## Related

- [environment.md](./environment.md) · [services.md](./services.md) · [database.md](./database.md)
