import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { AuthGuard } from '@shared/guards/auth.guard';
import { SuperAdminGuard } from '@shared/guards/super-admin.guard';
import { IAuthUser } from '@utils/global.type';
import {
  CreateOrderDto,
  OrderResponseDto,
  UpdateOrderStatusDto,
} from './order.dto';
import { OrderService } from './order.service';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /** Current user's orders (mobile). */
  @Get()
  async list(@CurrentUser() user: IAuthUser): Promise<OrderResponseDto[]> {
    return this.orderService.findForUser(user.userId);
  }

  /** All orders (admin). */
  @Get('manage')
  @UseGuards(SuperAdminGuard)
  async listAll(): Promise<OrderResponseDto[]> {
    return this.orderService.findAll();
  }

  @Post()
  async create(
    @CurrentUser() user: IAuthUser,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.orderService.create(user.userId, dto);
  }

  @Patch(':id/status')
  @UseGuards(SuperAdminGuard)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return this.orderService.updateStatus(id, dto.status);
  }
}
