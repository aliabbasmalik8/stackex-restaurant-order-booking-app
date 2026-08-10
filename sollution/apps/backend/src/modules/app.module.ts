import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@shared/shared.module';
import { BranchModule } from './branch/branch.module';
import { CategoryModule } from './category/category.module';
import { HealthModule } from './health/health.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
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
    SharedModule,
    HealthModule,
    UserModule,
    BranchModule,
    CategoryModule,
    ProductModule,
    OrderModule,
  ],
})
export class AppModule {}
