import { Module } from '@nestjs/common';
import { SharedModule } from '@shared/shared.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [SharedModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
