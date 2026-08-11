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
};
