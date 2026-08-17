import { Module } from '@nestjs/common';
import { SharedModule } from '@shared/shared.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PreviewAddressSeedService } from './preview-address-seed.service';

@Module({
  imports: [SharedModule],
  controllers: [AuthController],
  providers: [AuthService, PreviewAddressSeedService],
})
export class AuthModule {}
