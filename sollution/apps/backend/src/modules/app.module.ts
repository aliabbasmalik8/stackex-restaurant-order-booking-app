import { DatabaseModule } from '@database/database.module';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { BranchModule } from './branch/branch.module';
import { CategoryModule } from './category/category.module';
import { EventsModule } from './events/events.module';
import { HealthModule } from './health/health.module';
import { OrderModule } from './order/order.module';
import { StripePaymentsModule } from './stripe-payments/stripe-payments.module';
import { FirebaseStorageModule } from './firebase-storage/firebase-storage.module';
import { ProductModule } from './product/product.module';
import { SettingModule } from './setting/setting.module';
import { UserModule } from './user/user.module';

/** Set by `pnpm build:localSandbox` (`.env.localsandbox` → `dist/.env`). Plain `pnpm build` leaves this absent. */
const distEnvPath = join(__dirname, '..', '.env');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: existsSync(distEnvPath) ? distEnvPath : '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
        ...(configService.get<string>('environment') === 'development'
          ? {}
          : {
              ssl: { rejectUnauthorized: false },
            }),
      }),
    }),
    DatabaseModule,
    SharedModule,
    EventsModule,
    HealthModule,
    AuthModule,
    UserModule,
    BranchModule,
    CategoryModule,
    ProductModule,
    OrderModule,
    StripePaymentsModule,
    FirebaseStorageModule,
    SettingModule,
  ],
})
export class AppModule {}
