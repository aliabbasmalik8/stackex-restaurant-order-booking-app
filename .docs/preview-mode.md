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
| **Theme chip** | Sign-in + sign-up top bar, and Profile row → modal of palettes (`charcoal` … `olive`). Native and web. |
| **Theme (web iframe)** | Parent can also `postMessage` (below). Same live palette as the chip. |

Default palette remains `brand.paletteId` in `src/theme/brand.ts`. Preview overrides persist in AsyncStorage `preview_palette_id` (web: localStorage). Not a settings / API value.

### Web iframe — set palette

Parent chrome (preview host):

```js
iframe.contentWindow.postMessage(
  { source: 'preview-host', type: 'setPalette', paletteId: 'emerald' },
  iframeOrigin, // never '*'
);
```

`paletteId` must be one of: `charcoal` | `red` | `dark` | `emerald` | `saffron` | `midnight` | `olive`.

The app listens only when `EXPO_PUBLIC_PREVIEW_MODE` is on, and only from `window.parent`.

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
| **Product image upload** | Select image opens a notice modal — upload disabled; paste URL still works |

Helper: `sollution/apps/admin/src/lib/previewMode.ts` → `isPublicPreviewMode()`

Truthy values: `1` · `true` · `yes`. Leave unset in production.

---

## Checklist

| Task | Action |
|------|--------|
| Mobile welcome | `EXPO_PUBLIC_PREVIEW_MODE=1` |
| Mobile theme chip | Same flag — Theme on sign-in / sign-up / profile |
| Mobile theme (web iframe) | Same flag — chip **and** parent `postMessage` |
| Admin store lock | `VITE_IS_PUBLIC_PREVIEW_MODE=1` |
| Production | leave unset |
| Reset mobile welcome | clear app data / AsyncStorage `preview_welcome_shown` |
| Reset preview palette | clear AsyncStorage / localStorage `preview_palette_id` |

---

## Related

- [environment.md](./environment.md) · [services.md](./services.md) · [database.md](./database.md)
