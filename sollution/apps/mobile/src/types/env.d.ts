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
    EXPO_PUBLIC_FIREBASE_API_KEY?: string;
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
    EXPO_PUBLIC_FIREBASE_PROJECT_ID?: string;
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
    EXPO_PUBLIC_FIREBASE_APP_ID?: string;
    /** Google Maps JavaScript API (web pin map). HTTP-referrer key — not the Nest server key. */
    EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY?: string;
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?: string;
    EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?: string;
  }
}

export {};
