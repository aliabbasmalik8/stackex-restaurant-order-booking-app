export {
  signInWithPassword,
  signUpWithPassword,
  signOutUser,
} from './password'
export { lookupEmailAuthStatus, sendPasswordReset } from './emailAuthStatus'
export { signInWithGooglePopup, isGoogleSignInConfigured, linkGooglePopup } from './google'
export { useGoogleSignIn } from './useGoogleSignIn'
export { addPasswordToAccount, changeAccountPassword } from './passwordLink'
export {
  readSignInMethods,
  requireFirebaseUser,
  waitForFirebaseUser,
  type SignInMethodsSnapshot,
} from './signInMethods'
export { useSignInMethods } from './useSignInMethods'
export type { UseSignInMethodsResult } from './useSignInMethods'
export { useConnectGoogle } from './useConnectGoogle'
export {
  AuthError,
  toAuthError,
  authErrorMessageKey,
  type AuthErrorCode,
} from './errors'
export {
  profileFromUser,
  profileFromApiUser,
  authUserFromProfile,
  mergeAuthProfile,
  shortDisplayName,
  type AuthProfile,
  type AuthUser,
} from './profile'
export { useAuthAction } from './hooks'
