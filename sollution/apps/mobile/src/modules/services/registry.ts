import type { ServiceDefinition, ServiceId } from './types';

/**
 * Canonical feature catalog.
 * Gate UI with `getServiceStatus` / `isServiceInteractive` — see ai_instruction/features.
 */
export const SERVICE_REGISTRY: Record<ServiceId, ServiceDefinition> = {
  passwordLogin: {
    id: 'passwordLogin',
    mode: 'enabled',
  },
  phoneLogin: {
    id: 'phoneLogin',
    mode: 'enabled',
    unavailableReasonKey: 'services.previewUnavailable',
    requiredEnvKeys: ['EXPO_PUBLIC_SERVICE_PHONE_LOGIN'],
    alternativeAvailable: true,
  },
  createAccountPassword: {
    id: 'createAccountPassword',
    mode: 'enabled',
  },
  createAccountPhone: {
    id: 'createAccountPhone',
    mode: 'enabled',
    unavailableReasonKey: 'services.previewUnavailable',
    requiredEnvKeys: ['EXPO_PUBLIC_SERVICE_CREATE_ACCOUNT_PHONE'],
    alternativeAvailable: true,
  },
  continueAsGuest: {
    id: 'continueAsGuest',
    mode: 'enabled',
  },
  appleLogin: {
    id: 'appleLogin',
    mode: 'enabled',
    unavailableReasonKey: 'services.previewUnavailable',
    requiredEnvKeys: ['EXPO_PUBLIC_SERVICE_APPLE_LOGIN'],
    alternativeAvailable: true,
  },
  googleLogin: {
    id: 'googleLogin',
    mode: 'enabled',
    unavailableReasonKey: 'services.previewUnavailable',
    requiredEnvKeys: ['EXPO_PUBLIC_SERVICE_GOOGLE_LOGIN'],
    alternativeAvailable: true,
  },
  paymentMethods: {
    id: 'paymentMethods',
    mode: 'enabled',
    unavailableReasonKey: 'services.previewUnavailable',
    requiredEnvKeys: ['EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY'],
    alternativeAvailable: true,
  },
  notifications: {
    id: 'notifications',
    mode: 'enabled',
    unavailableReasonKey: 'services.previewUnavailable',
    requiredEnvKeys: ['EXPO_PUBLIC_SERVICE_NOTIFICATIONS'],
    alternativeAvailable: false,
  },
  helpSupport: {
    id: 'helpSupport',
    mode: 'enabled',
    unavailableReasonKey: 'services.previewUnavailable',
    requiredEnvKeys: ['EXPO_PUBLIC_SERVICE_HELP_SUPPORT'],
    alternativeAvailable: false,
  },
};

export const SERVICE_IDS = Object.keys(SERVICE_REGISTRY) as ServiceId[];
