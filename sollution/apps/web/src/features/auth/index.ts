import {
  getFeatureStatus,
  isFeatureInteractive,
  shouldRenderFeature,
} from '@/features/_registry'
import type { FeatureStatus } from '@/features/_registry'
import { isGoogleSignInConfigured } from '@/core/auth/google'

export const PASSWORD_AUTH_ID = 'passwordAuth' as const
export const PHONE_AUTH_ID = 'phoneAuth' as const
export const GOOGLE_AUTH_ID = 'googleAuth' as const
export const APPLE_AUTH_ID = 'appleAuth' as const

export function getPasswordAuthStatus() {
  return getFeatureStatus(PASSWORD_AUTH_ID)
}
export function isPasswordAuthInteractive() {
  return isFeatureInteractive(PASSWORD_AUTH_ID)
}
export function shouldRenderPasswordAuth() {
  return shouldRenderFeature(PASSWORD_AUTH_ID)
}

export function getPhoneAuthStatus() {
  return getFeatureStatus(PHONE_AUTH_ID)
}
export function isPhoneAuthInteractive() {
  return isFeatureInteractive(PHONE_AUTH_ID)
}
export function shouldRenderPhoneAuth() {
  return shouldRenderFeature(PHONE_AUTH_ID)
}

export function getGoogleAuthStatus(): FeatureStatus {
  const status = getFeatureStatus(GOOGLE_AUTH_ID)
  if (status.mode === 'enabled' && !isGoogleSignInConfigured()) {
    return {
      ...status,
      mode: 'disabled',
      reasonKey: status.reasonKey ?? 'features.previewUnavailable',
    }
  }
  return status
}
export function isGoogleAuthInteractive() {
  return getGoogleAuthStatus().mode === 'enabled'
}
export function shouldRenderGoogleAuth() {
  return getGoogleAuthStatus().mode !== 'hidden'
}

export function getAppleAuthStatus() {
  return getFeatureStatus(APPLE_AUTH_ID)
}
export function isAppleAuthInteractive() {
  return isFeatureInteractive(APPLE_AUTH_ID)
}
export function shouldRenderAppleAuth() {
  return shouldRenderFeature(APPLE_AUTH_ID)
}
