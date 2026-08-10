export type AppConfig = {
  PORT: number;
  environment: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  REDIS_URL_DEFAULT: string;
};
