import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@shared/guards/auth.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { IStoredTokenData } from '@utils/global.type';
import { AuthResponseDto, LoginUserDto, UserResponseDto } from './user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    return this.usersService.login(loginUserDto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: IStoredTokenData): Promise<UserResponseDto> {
    return this.usersService.findOne(user.userId);
  }
}
