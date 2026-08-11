/**
 * Auth capability helpers (login / signup methods).
 * UI: `@/feature-ui/auth`
 *
 * Individual methods stay as FeatureIds for env gating;
 * they all live under this one feature folder.
 */
import {
  getFeatureStatus,
  isFeatureInteractive,
  shouldRenderFeature,
} from '@/features/_registry';

export const PASSWORD_AUTH_ID = 'passwordAuth' as const;
export const PHONE_AUTH_ID = 'phoneAuth' as const;
export const GOOGLE_AUTH_ID = 'googleAuth' as const;
export const APPLE_AUTH_ID = 'appleAuth' as const;

export function getPasswordAuthStatus() {
  return getFeatureStatus(PASSWORD_AUTH_ID);
}
export function isPasswordAuthInteractive() {
  return isFeatureInteractive(PASSWORD_AUTH_ID);
}
export function shouldRenderPasswordAuth() {
  return shouldRenderFeature(PASSWORD_AUTH_ID);
}

export function getPhoneAuthStatus() {
  return getFeatureStatus(PHONE_AUTH_ID);
}
export function isPhoneAuthInteractive() {
  return isFeatureInteractive(PHONE_AUTH_ID);
}
export function shouldRenderPhoneAuth() {
  return shouldRenderFeature(PHONE_AUTH_ID);
}

export function getGoogleAuthStatus() {
  return getFeatureStatus(GOOGLE_AUTH_ID);
}
export function isGoogleAuthInteractive() {
  return isFeatureInteractive(GOOGLE_AUTH_ID);
}
export function shouldRenderGoogleAuth() {
  return shouldRenderFeature(GOOGLE_AUTH_ID);
}

export function getAppleAuthStatus() {
  return getFeatureStatus(APPLE_AUTH_ID);
}
export function isAppleAuthInteractive() {
  return isFeatureInteractive(APPLE_AUTH_ID);
}
export function shouldRenderAppleAuth() {
  return shouldRenderFeature(APPLE_AUTH_ID);
}
