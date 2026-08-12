# Error handling (`OrderBookingException`)

> Adapted from native-builder-backend `NativeBuilderException`.

## Location

`src/utils/order-booking.exception.ts` — import via `@utils/order-booking.exception`.

Global filter registered in `main.ts` (`OrderBookingExceptionFilter`) so guards also return the same body.

## Shape

```ts
throw new OrderBookingException({
  error_detail: 'Branch 42 not found for admin update', // server log (may be technical)
  notify: false, // reserved — notification wiring later
  user_error_detail: {
    english: 'Branch not found.',
    arabic: 'الفرع غير موجود.',
  }, // shown to the user — MUST stay non-technical
  statusCode: 404, // optional; default 400
  error_code: 'ITEM_UNAVAILABLE', // optional machine code for clients
  error_data: { unavailableMenuItemIds: [] }, // optional extras merged into HTTP body
});
```

| Field | Audience | Notes |
|-------|----------|--------|
| `error_detail` | Server logs | English detail; may include IDs / internals |
| `user_error_detail` | HTTP client / UI | Bilingual, **non-technical** — what the user sees |
| `notify` | Ops (later) | When `true`, logs a stub warning until notify is wired |
| `statusCode` | HTTP | Used by controller handler / filter (default `400`) |
| `error_code` | Clients | Optional machine code (`code` in JSON) |
| `error_data` | Clients | Optional extras merged into JSON (ids, counts) — not user copy |

## Rules

1. **Services / utils / guards** — throw `OrderBookingException`. Do **not** throw Nest `BadRequestException` / `NotFoundException` / etc.
2. **`user_error_detail` must stay user-safe** — no stack traces, DB codes, Stripe payloads, env key names, or internal IDs in the english/arabic strings.
3. **Catch + normalize** — re-raise ours or wrap foreign errors with `ensureOrderBookingException`.
4. **Controllers** — every handler: `try/catch` + `handleControllerError` (maps ours → HTTP; re-throws anything else).

## HTTP response body

```json
{
  "statusCode": 404,
  "user_error_detail": {
    "english": "Branch not found.",
    "arabic": "الفرع غير موجود."
  },
  "code": "ITEM_UNAVAILABLE",
  "unavailableMenuItemIds": ["…"]
}
```

`error_detail` and `notify` stay server-side.

## Integration status

- [x] Backend utils + global filter + module migration
- [x] Admin `getErrorMessage` + hooks/screens
- [x] Mobile `getErrorMessage` + StateMessage / checkout / payments
- [ ] Wire `notify` to a real ops channel

## Client display (`getErrorMessage`)

| App | Doc | Helper |
|-----|-----|--------|
| Admin | [`../../admin/ai_instruction/error-handling.md`](../../admin/ai_instruction/error-handling.md) | `@/lib/getErrorMessage` |
| Mobile | [`../../mobile/ai_instruction/error-handling.md`](../../mobile/ai_instruction/error-handling.md) | `@/lib/errors` → `getErrorMessage` |

```ts
getErrorMessage(error, 'Something went wrong.');
// → user_error_detail.english | .arabic by current i18n language
// → else the required defaultMessage
```

API clients attach `user_error_detail` on `ApiError`. UI must use `getErrorMessage` for display strings.

## Related

- [coding-standards.md](./coding-standards.md)
- [architecture.md](./architecture.md)
- Admin client: [error-handling.md](../../admin/ai_instruction/error-handling.md)
- Mobile client: [error-handling.md](../../mobile/ai_instruction/error-handling.md)
