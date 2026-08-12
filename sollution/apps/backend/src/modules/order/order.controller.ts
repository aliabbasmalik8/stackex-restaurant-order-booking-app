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
import { handleControllerError } from '@utils/order-booking.exception';
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
    try {
      return await this.orderService.findForUser(user.userId);
    } catch (error) {
      handleControllerError(error);
    }
  }

  /** All orders (admin). */
  @Get('manage')
  @UseGuards(SuperAdminGuard)
  async listAll(): Promise<OrderResponseDto[]> {
    try {
      return await this.orderService.findAll();
    } catch (error) {
      handleControllerError(error);
    }
  }

  @Post()
  async create(
    @CurrentUser() user: IAuthUser,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    try {
      return await this.orderService.create(user.userId, dto);
    } catch (error) {
      handleControllerError(error);
    }
  }

  @Patch(':id/status')
  @UseGuards(SuperAdminGuard)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    try {
      return await this.orderService.updateStatus(id, dto.status);
    } catch (error) {
      handleControllerError(error);
    }
  }
}
