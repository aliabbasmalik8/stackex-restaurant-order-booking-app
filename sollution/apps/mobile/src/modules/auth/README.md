# Auth module (Firebase)

Password email auth for preview. UI forms stay under `screens/auth/components/`;
this module owns Firebase Auth calls + error mapping.

```text
modules/auth/
  password.ts   # signIn / signUp / signOut
  errors.ts     # AuthError → i18n keys
  index.ts
```

Requires Email/Password enabled in Firebase Console. Session persists via
AsyncStorage (`getFirebaseAuth` in `src/lib/firebase.ts`).

Guest browse = no Firebase user. `AuthContext` listens with `onAuthStateChanged`.
