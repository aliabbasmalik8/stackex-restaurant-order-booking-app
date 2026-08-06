# Auth module (Firebase)

Password email auth for preview. UI forms stay under `screens/auth/components/`;
this module owns Firebase Auth calls, error mapping, and reusable auth gates.

```text
modules/auth/
  password.ts              # signIn / signUp / signOut
  errors.ts                # AuthError → i18n keys
  components/
    AuthRequiredView.tsx     # guest placeholder (go home)
  hooks/
    useRequireAuthScreen.ts  # whole-route gate
    useAuthAction.ts         # button / tab action gate
  index.ts
```

## Two gate cases

| Case | Hook | Guest behavior |
|------|------|----------------|
| User taps something (profile avatar, tab, checkout) | `useAuthAction` | **Stay put** + open **login modal** |
| User somehow landed on a protected route | `useRequireAuthScreen` | **Replace → sign-in `/`** (no modal) |

**Action** — prevent forward, show modal:

```tsx
const runAuthed = useAuthAction('/(tabs)/profile');
onOpenProfile={() => runAuthed(() => router.push('/(tabs)/profile'))}
// tabPress: if (!runAuthed()) e.preventDefault();
```

**Screen** — already there, send to login (or stay with placeholder):

```tsx
// Soft land: placeholder, no navigation
useRequireAuthScreen({ redirectTo: null });
return <AuthRequiredView loading={!authReady} />;

// Hard bounce to sign-in page (no modal)
useRequireAuthScreen({ redirectTo: '/checkout' });
```

Requires Email/Password enabled in Firebase Console. Session persists via
AsyncStorage (`getFirebaseAuth` in `src/lib/firebase.ts`).

Guest browse = no Firebase user. `AuthContext` listens with `onAuthStateChanged`.
