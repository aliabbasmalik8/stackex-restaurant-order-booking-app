import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@shared/guards/auth.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { IAuthUser } from '@utils/global.type';
import { UpdateProfileDto, UserResponseDto } from './user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: IAuthUser): Promise<UserResponseDto> {
    return this.usersService.findOne(user.userId);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMe(
    @CurrentUser() user: IAuthUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(user.userId, dto);
  }
}
