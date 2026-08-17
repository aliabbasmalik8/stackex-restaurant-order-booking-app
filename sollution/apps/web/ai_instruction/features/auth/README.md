# Feature area: auth

**Code:** `src/features/auth/` · **UI:** `src/feature-ui/auth/` · **HTTP:** `src/api/OrderBooking/modules/auth/`

Same Nest routes as mobile:

| Method | Path |
|--------|------|
| `POST` | `/api/auth/firebase` |
| `POST` | `/api/auth/email-status` |

## Password + Google

1. Email → `POST /api/auth/email-status`
   - `ok` → password field → Firebase `signInWithEmailAndPassword`
   - `account-not-exist` → error
   - `password-reset-required` → Firebase `sendPasswordResetEmail`
2. Google: Firebase popup (web only)
3. Firebase ID token → `POST /api/auth/firebase` → Nest JWTs in `localStorage`

Phone auth is registered but `hidden`. Apple shows disabled unless `VITE_FEATURE_APPLE_AUTH` is set (no Apple JS SDK yet).
