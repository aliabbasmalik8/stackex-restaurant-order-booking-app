import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@shared/guards/auth.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { IAuthUser } from '@utils/global.type';
import { handleControllerError } from '@utils/order-booking.exception';
import { UpdateProfileDto, UserResponseDto } from './user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: IAuthUser): Promise<UserResponseDto> {
    try {
      return await this.usersService.findOne(user.userId);
    } catch (error) {
      handleControllerError(error);
    }
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMe(
    @CurrentUser() user: IAuthUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    try {
      return await this.usersService.updateProfile(user.userId, dto);
    } catch (error) {
      handleControllerError(error);
    }
  }
}
