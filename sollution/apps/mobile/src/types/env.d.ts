/// <reference types="expo-router" />

declare namespace NodeJS {
  interface ProcessEnv {
    /** Nest backend origin (no trailing slash). Paths are under `/api`. */
    EXPO_PUBLIC_API_URL?: string;
    /** Optional — show one-time preview welcome on sign-in. */
    EXPO_PUBLIC_PREVIEW_MODE?: string;
  }
}

export {};
