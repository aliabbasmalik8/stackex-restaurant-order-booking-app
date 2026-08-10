import { Order } from '@database/entities/Order.model';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@shared/shared.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), SharedModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
