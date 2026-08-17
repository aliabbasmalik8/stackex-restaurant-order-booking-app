# Error handling (`getErrorMessage`)

Same contract as mobile. Backend: [`../../backend/ai_instruction/error-handling.md`](../../backend/ai_instruction/error-handling.md)

`src/lib/errors.ts` exports:

| Export | Role |
|--------|------|
| `getErrorMessage(error, defaultMessage)` | Localized user string from `user_error_detail`, else default |
| `toAppError(error)` | Machine `AppErrorCode` |
| `errorMessageKey` / `errorTitleKey` | i18n keys for `StateMessage` |

**Every user-visible API failure string** goes through `getErrorMessage`.
