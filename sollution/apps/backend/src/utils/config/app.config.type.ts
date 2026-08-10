export type AppConfig = {
  PORT: number;
  environment: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  /** Comma-separated browser origins allowed by CORS (no trailing slash). */
  CORS_ORIGINS?: string;
};
