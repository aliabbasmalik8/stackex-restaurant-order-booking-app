/// <reference types="expo-router" />

declare namespace NodeJS {
  interface ProcessEnv {
    /** Nest backend origin (no trailing slash). Paths are under `/api`. */
    EXPO_PUBLIC_API_URL?: string;
    /** Optional — show one-time preview welcome on sign-in. */
    EXPO_PUBLIC_PREVIEW_MODE?: string;
    /** Stripe publishable key (pk_…) — also gates `stripePayment`. */
    EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
    EXPO_PUBLIC_FEATURE_APPLE_AUTH?: string;
    EXPO_PUBLIC_FEATURE_GOOGLE_AUTH?: string;
  }
}

export {};
