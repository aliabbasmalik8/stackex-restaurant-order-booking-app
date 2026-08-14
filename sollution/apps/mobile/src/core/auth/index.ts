export {
  signInWithPassword,
  signUpWithPassword,
  signOutUser,
} from './password';
export { lookupEmailAuthStatus, sendPasswordReset } from './emailAuthStatus';
export { addPasswordToAccount, changeAccountPassword } from './passwordLink';
export {
  readSignInMethods,
  requireFirebaseUser,
  type SignInMethodsSnapshot,
} from './signInMethods';
export { useSignInMethods } from './useSignInMethods';
export type { UseSignInMethodsResult } from './useSignInMethods';
export {
  signInWithGoogleIdToken,
  signInWithGooglePopup,
  isGoogleSignInConfigured,
  useGoogleAuthRequest,
  linkGoogleIdToken,
  linkGooglePopup,
} from './google';
export { useGoogleSignIn } from './useGoogleSignIn';
export { useConnectGoogle } from './useConnectGoogle';
export {
  AuthError,
  toAuthError,
  authErrorMessageKey,
  type AuthErrorCode,
} from './errors';
export {
  profileFromUser,
  profileFromApiUser,
  authUserFromProfile,
  mergeAuthProfile,
  shortDisplayName,
  type AuthProfile,
  type AuthUser,
} from './profile';
export {
  useRequireAuthScreen,
  useAuthAction,
  type UseRequireAuthScreenOptions,
  type UseRequireAuthScreenResult,
} from './hooks';
export { AuthRequiredView } from './components/AuthRequiredView';
