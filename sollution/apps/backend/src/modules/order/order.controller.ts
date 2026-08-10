import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { AuthGuard } from '@shared/guards/auth.guard';
import { IAuthUser } from '@utils/global.type';
import { CreateOrderDto, OrderResponseDto } from './order.dto';
import { OrderService } from './order.service';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async list(@CurrentUser() user: IAuthUser): Promise<OrderResponseDto[]> {
    return this.orderService.findForUser(user.userId);
  }

  @Post()
  async create(
    @CurrentUser() user: IAuthUser,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.orderService.create(user.userId, dto);
  }
}
