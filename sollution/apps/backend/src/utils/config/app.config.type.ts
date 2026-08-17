export type AppConfig = {
  PORT: number;
  environment: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  /** Comma-separated browser origins allowed by CORS (no trailing slash). */
  CORS_ORIGINS?: string;
  /**
   * White-label Stripe secrets — each client deploy uses their own Stripe account.
   * Omit STRIPE_SECRET_KEY to disable card payments for this deployment.
   * Currency / business name live in `app_setting` (see settings catalog).
   */
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  /** Firebase Admin — verify client ID tokens (optional until social auth is wired). */
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_CLIENT_EMAIL?: string;
  FIREBASE_PRIVATE_KEY?: string;
  /**
   * Firebase Storage bucket (e.g. `my-project.appspot.com` or `my-project.firebasestorage.app`).
   * Required for product image upload (`firebase-storage` module).
   */
  FIREBASE_STORAGE_BUCKET?: string;
  /**
   * Google Maps Platform server key (Geocoding API). Omit to disable reverse geocode.
   */
  GOOGLE_MAPS_API_KEY?: string;
  /**
   * Preview deployments: seed a default pin near the kitchen for new testers.
   * Unset in production. Truthy: 1 | true | yes.
   */
  IS_PUBLIC_PREVIEW_MODE?: string;
};
