/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  /** Admin env only — when true/1/yes, UI blocks store close, image upload, location edit. */
  readonly VITE_IS_PUBLIC_PREVIEW_MODE?: string
  /**
   * Feature flag: Firebase Storage product image upload.
   * Also requires registry `firebaseStorage.mode = 'enabled'`.
   */
  readonly VITE_FEATURE_FIREBASE_STORAGE?: string
  /**
   * Maps JavaScript API (branch pin editor). HTTP-referrer key — not the Nest
   * Geocoding/Places key. Omit → location section stays lat/lng fields only.
   */
  readonly VITE_GOOGLE_MAPS_WEB_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
