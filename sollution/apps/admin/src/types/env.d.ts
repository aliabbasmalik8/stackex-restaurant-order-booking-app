/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  /** Admin env only — when true/1/yes, UI blocks closing the store. */
  readonly VITE_IS_PUBLIC_PREVIEW_MODE?: string
  /**
   * Feature flag: Firebase Storage product image upload.
   * Also requires registry `firebaseStorage.mode = 'enabled'`.
   */
  readonly VITE_FEATURE_FIREBASE_STORAGE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
