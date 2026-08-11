/// <reference types="expo-router" />

declare namespace NodeJS {
  interface ProcessEnv {
    /** Nest backend origin (no trailing slash). Paths are under `/api`. */
    EXPO_PUBLIC_API_URL?: string;
    /** Optional — show one-time preview welcome on sign-in. */
    EXPO_PUBLIC_PREVIEW_MODE?: string;
    /** Stripe publishable key (pk_…) — also gates card checkout UI. */
    EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
    EXPO_PUBLIC_SERVICE_APPLE_LOGIN?: string;
    EXPO_PUBLIC_SERVICE_GOOGLE_LOGIN?: string;
    EXPO_PUBLIC_SERVICE_PHONE_LOGIN?: string;
    EXPO_PUBLIC_SERVICE_CREATE_ACCOUNT_PHONE?: string;
    EXPO_PUBLIC_SERVICE_NOTIFICATIONS?: string;
    EXPO_PUBLIC_SERVICE_HELP_SUPPORT?: string;
  }
}

export {};
