import { ConfigService } from '@nestjs/config';

/**
 * Stripe secrets from env (per white-label deploy).
 * Currency / business name come from `app_setting` (catalog + overrides).
 */
export type StripeSecretsConfig = {
  secretKey: string;
  webhookSecret: string;
};

export function readStripeSecrets(
  config: ConfigService,
): StripeSecretsConfig | null {
  const secretKey = config.get<string>('STRIPE_SECRET_KEY')?.trim();
  if (!secretKey) {
    return null;
  }

  return {
    secretKey,
    webhookSecret: config.get<string>('STRIPE_WEBHOOK_SECRET')?.trim() ?? '',
  };
}

/** Convert major-unit total (e.g. 12.50) to Stripe minor units. */
export function toStripeAmount(totalMajor: number): number {
  return Math.round(Number(totalMajor) * 100);
}
