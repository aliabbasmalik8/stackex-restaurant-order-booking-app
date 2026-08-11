import { Module } from '@nestjs/common';
import { SharedModule } from '@shared/shared.module';
import { SettingModule } from '../setting/setting.module';
import { StripePaymentsController } from './stripe-payments.controller';
import { StripePaymentsService } from './stripe-payments.service';

@Module({
  imports: [SharedModule, SettingModule],
  controllers: [StripePaymentsController],
  providers: [StripePaymentsService],
})
export class StripePaymentsModule {}
