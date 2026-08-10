export const APP_ENVIRONMENTS = ['development', 'staging', 'production'] as const;

export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

export function isAppEnvironment(value: string | undefined): value is AppEnvironment {
  return (APP_ENVIRONMENTS as readonly string[]).includes(value ?? '');
}

export function getAppEnvironment(
  raw: string | undefined = process.env.environment,
): AppEnvironment {
  if (isAppEnvironment(raw)) {
    return raw;
  }

  const received = raw === undefined ? '(unset)' : `"${raw}"`;
  throw new Error(
    `Invalid environment ${received}. Expected one of: ${APP_ENVIRONMENTS.join(', ')}`,
  );
}

export function isRunningLocally(
  environment: AppEnvironment = getAppEnvironment(),
): boolean {
  return environment === 'development';
}
