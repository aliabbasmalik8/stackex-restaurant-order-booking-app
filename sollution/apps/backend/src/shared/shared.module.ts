import { User } from '@database/entities/UserModel.model';
import { UserDbService } from '@database/services/user-db.service';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '@utils/config/app.config.type';
import { ACCESS_TOKEN_EXPIRY } from '@utils/constant';
import { AuthGuard } from './guards/auth.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { AuthService } from './services/auth.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: String(ACCESS_TOKEN_EXPIRY) as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  providers: [AuthService, AuthGuard, SuperAdminGuard, UserDbService],
  exports: [
    AuthService,
    AuthGuard,
    SuperAdminGuard,
    UserDbService,
    JwtModule,
    TypeOrmModule,
  ],
})
export class SharedModule {}
