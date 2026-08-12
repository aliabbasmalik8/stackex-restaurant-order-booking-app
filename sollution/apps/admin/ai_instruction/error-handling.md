# Error handling (`getErrorMessage`)

> Backend contract: [`../../backend/ai_instruction/error-handling.md`](../../backend/ai_instruction/error-handling.md)  
> Nest returns `{ statusCode, user_error_detail: { english, arabic }, code?, … }`.

## Location

`src/lib/getErrorMessage.ts` — import via `@/lib/getErrorMessage`.

`ApiError` (`src/api/OrderBooking/client.ts`) stores `user_error_detail` from the response body.

i18n fallbacks live under `errors.*` in `src/i18n/locales/{en,ar}.ts`.

## Rule

**Every user-visible API failure string** goes through `getErrorMessage`. Do **not** show raw `error.message`, Nest `message`, or `error_detail` to the user.

```ts
import { getErrorMessage } from '@/lib/getErrorMessage';

setError(getErrorMessage(err, t('errors.saveFailed')));
```

| Input | Result |
|-------|--------|
| `user_error_detail` present | `english` or `arabic` from current i18n language |
| Preferred language empty | Other language if present |
| No `user_error_detail` | Required `defaultMessage` (use `t('errors.*')`) |

## Patterns

### Module hooks

Resolve once when exposing `error: string | null`:

```ts
getErrorMessage(query.error, t('errors.loadOrders'))
getErrorMessage(err, t('errors.saveFailed'))
```

### `StateBlock`

```tsx
{/* Pre-resolved string from a hook */}
<StateBlock error={error} onRetry={refresh}>…</StateBlock>

{/* Or raw cause — StateBlock calls getErrorMessage internally */}
<StateBlock
  errorCause={listQuery.error}
  error={t('errors.loadSettings')}
  onRetry={() => void listQuery.refetch()}
>
  …
</StateBlock>
```

### Machine vs display

Status / codes (`409`, `CATEGORY_IN_USE`, counts) may still inspect `ApiError.status` / `ApiError.data`. Keep that separate from user-facing copy.

## Do not

- Hardcode English-only fallbacks when an `errors.*` i18n key exists
- Surface Stripe / env / stack / IDs in UI defaults
- Duplicate bilingual parsing in screens — always use the helper

## Related

- [coding-standards.md](./coding-standards.md)
- [architecture.md](./architecture.md)
- Backend: [error-handling.md](../../backend/ai_instruction/error-handling.md)
