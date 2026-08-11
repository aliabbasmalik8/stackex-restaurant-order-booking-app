import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './modules/app.module';

/** Comma-separated `CORS_ORIGINS`, trimmed; empty → reflect request origin (dev-friendly). */
function resolveCorsOrigins(raw: string | undefined): boolean | string[] {
  const list = (raw ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  return list.length > 0 ? list : true;
}

async function bootstrap() {
  /** rawBody required for Stripe webhook signature verification */
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const configService = app.get(ConfigService);
  const corsOrigins = resolveCorsOrigins(
    configService.get<string>('CORS_ORIGINS'),
  );

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Timezone',
      'X-Languages',
    ],
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(configService.get<string>('PORT')) || 8000;

  await app.listen(port);

  console.log(`Server running on http://localhost:${port}`);
  console.log(`Health: http://localhost:${port}/api/health`);
}

void bootstrap();
