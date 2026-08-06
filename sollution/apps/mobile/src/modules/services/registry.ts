import type { ServiceDefinition, ServiceId } from './types';

/**
 * Canonical service catalog for this template.
 * Add new preview/customer addons here — then gate UI with `getServiceStatus`.
 */
export const SERVICE_REGISTRY: Record<ServiceId, ServiceDefinition> = {
  passwordLogin: {
    id: 'passwordLogin',
    mode: 'enabled',
  },
  phoneLogin: {
    id: 'phoneLogin',
    /** OTP cost / provider not in preview — keep component, hide UI. */
    mode: 'hidden',
    unavailableReasonKey: 'services.previewUnavailable',
    envEnableKey: 'EXPO_PUBLIC_SERVICE_PHONE_LOGIN',
  },
  createAccountPassword: {
    id: 'createAccountPassword',
    mode: 'enabled',
  },
  createAccountPhone: {
    id: 'createAccountPhone',
    mode: 'hidden',
    unavailableReasonKey: 'services.previewUnavailable',
    envEnableKey: 'EXPO_PUBLIC_SERVICE_CREATE_ACCOUNT_PHONE',
  },
  continueAsGuest: {
    id: 'continueAsGuest',
    mode: 'enabled',
  },
  appleLogin: {
    id: 'appleLogin',
    mode: 'disabled',
    unavailableReasonKey: 'services.previewUnavailable',
    envEnableKey: 'EXPO_PUBLIC_SERVICE_APPLE_LOGIN',
  },
  googleLogin: {
    id: 'googleLogin',
    mode: 'disabled',
    unavailableReasonKey: 'services.previewUnavailable',
    envEnableKey: 'EXPO_PUBLIC_SERVICE_GOOGLE_LOGIN',
  },
};

export const SERVICE_IDS = Object.keys(SERVICE_REGISTRY) as ServiceId[];
