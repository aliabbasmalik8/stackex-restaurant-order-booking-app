import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { AppConfig } from '@utils/config/app.config.type';
import { ACCESS_TOKEN_EXPIRY } from '@utils/constant';
import { AuthGuard } from './guards/auth.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { AuthService } from './services/auth.service';
import { FirebaseAdminService } from './services/firebase-admin.service';

@Global()
@Module({
  imports: [
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
  providers: [AuthService, AuthGuard, SuperAdminGuard, FirebaseAdminService],
  exports: [
    AuthService,
    AuthGuard,
    SuperAdminGuard,
    JwtModule,
    FirebaseAdminService,
  ],
})
export class SharedModule {}
