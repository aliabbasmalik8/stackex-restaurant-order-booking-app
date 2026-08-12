# Error handling (`getErrorMessage`)

> Backend contract: [`../../backend/ai_instruction/error-handling.md`](../../backend/ai_instruction/error-handling.md)  
> Nest returns `{ statusCode, user_error_detail: { english, arabic }, code?, … }`.

## Location

`src/lib/errors.ts` exports:

| Export | Role |
|--------|------|
| `getErrorMessage(error, defaultMessage)` | Localized user string from `user_error_detail`, else default |
| `toAppError(error)` | Machine `AppErrorCode` (+ preserves `user_error_detail` / unavailable ids) |
| `errorMessageKey` / `errorTitleKey` | i18n keys for `StateMessage` when no API detail |

`ApiError` (`src/api/OrderBooking/client.ts`) stores `user_error_detail` from the response body.

## Rule

**Every user-visible API failure string** goes through `getErrorMessage`. Prefer backend bilingual copy over generic i18n when the API sent `user_error_detail`.

```ts
import { getErrorMessage, toAppError, errorMessageKey } from '@/lib/errors';

setErrorMessage(
  getErrorMessage(error, t(errorMessageKey(toAppError(error).code))),
);
```

| Input | Result |
|-------|--------|
| `user_error_detail` present | `english` / `arabic` from current i18n language |
| Preferred language empty | Other language if present |
| No `user_error_detail` | Required `defaultMessage` (usually `t(errorMessageKey(…))`) |

## Patterns

### Inline / form errors

```ts
getErrorMessage(error, t('errors.unknown.message'));
```

Checkout, profile, address modal, payment (`getPaymentErrorDetail` already wraps `getErrorMessage`).

### `StateMessage`

Pass both code (title / icon) and raw error (message body):

```tsx
<StateMessage errorCode={errorCode} error={error} onAction={retry} />
```

`StateMessage` calls `getErrorMessage(error, t(errorMessageKey(errorCode)))` internally.

Catalog / orders hooks should expose `error` (raw) + `errorCode` so screens can pass both.

### Machine codes still matter

Keep using `toAppError` for flow control (`item_unavailable` → remove cart lines, `store_closed`, etc.). Display copy still goes through `getErrorMessage`.

## Do not

- Show raw `ApiError.message` when it might be Nest/technical
- Skip `getErrorMessage` in new catch → `setErrorMessage` paths
- Put IDs / Stripe / env strings into user-facing defaults

## Related

- [coding-standards.md](./coding-standards.md)
- [architecture.md](./architecture.md)
- Payment: [features/stripe-payment/README.md](./features/stripe-payment/README.md)
- Backend: [error-handling.md](../../backend/ai_instruction/error-handling.md)
