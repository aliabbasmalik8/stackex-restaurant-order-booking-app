# Error handling (`getErrorMessage`)

> Backend contract: [`../../backend/ai_instruction/error-handling.md`](../../backend/ai_instruction/error-handling.md)  
> Nest returns `{ statusCode, user_error_detail: { english, arabic }, code?, … }`.

## Location

`src/lib/getErrorMessage.ts` — import via `@/lib/getErrorMessage`.

`ApiError` (`src/api/OrderBooking/client.ts`) stores `user_error_detail` from the response body.

## Rule

**Every user-visible API failure string** goes through `getErrorMessage`. Do **not** show `error.message`, Nest `message`, or `error_detail` to the user.

```ts
import { getErrorMessage } from '@/lib/getErrorMessage';

setError(getErrorMessage(err, 'Failed to save'));
// or with i18n fallback:
setError(getErrorMessage(err, t('auth.errors.unknown')));
```

| Input | Result |
|-------|--------|
| `user_error_detail` present | `english` or `arabic` from current i18n language (`i18n.language`) |
| Preferred language empty | Other language if present |
| No `user_error_detail` | Required `defaultMessage` argument |

## Where to use

- Module hooks that expose `error: string | null` (list / editor / save / delete)
- Login and any catch that sets UI error text
- Screens that read React Query `error` for `StateBlock` / banners

Machine handling (status `409`, `code`, `count`) may still inspect `ApiError.status` / `ApiError.data` — keep that separate from display copy.

## Do not

- Surface Stripe / env / stack / IDs in UI defaults unless product asks
- Pass technical Nest strings as the only message without `getErrorMessage`
- Duplicate bilingual parsing in screens — always use the helper

## Related

- [coding-standards.md](./coding-standards.md)
- [architecture.md](./architecture.md)
- Backend: [error-handling.md](../../backend/ai_instruction/error-handling.md)
