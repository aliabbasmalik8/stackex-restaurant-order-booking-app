import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@shared/guards/auth.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { IAuthUser } from '@utils/global.type';
import { handleControllerError } from '@utils/order-booking.exception';
import { AddressResponseDto, CreateAddressDto } from './address.dto';
import { AddressService } from './address.service';

@Controller('addresses')
@UseGuards(AuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  async list(@CurrentUser() user: IAuthUser): Promise<AddressResponseDto[]> {
    try {
      return await this.addressService.listForUser(user.userId);
    } catch (error) {
      handleControllerError(error);
    }
  }

  @Post()
  async create(
    @CurrentUser() user: IAuthUser,
    @Body() dto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    try {
      return await this.addressService.createForUser(user.userId, dto);
    } catch (error) {
      handleControllerError(error);
    }
  }
}
