import { Module } from '@nestjs/common';
import { SharedModule } from '@shared/shared.module';
import { SettingModule } from '../setting/setting.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [SharedModule, SettingModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
