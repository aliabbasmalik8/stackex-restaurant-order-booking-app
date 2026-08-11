import { DatabaseModule } from '@database/database.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@shared/shared.module';
import { BranchModule } from './branch/branch.module';
import { CategoryModule } from './category/category.module';
import { HealthModule } from './health/health.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { ProductModule } from './product/product.module';
import { SettingModule } from './setting/setting.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
    HealthModule,
    UserModule,
    BranchModule,
    CategoryModule,
    ProductModule,
    OrderModule,
    PaymentModule,
    SettingModule,
  ],
})
export class AppModule {}
