import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@shared/guards/auth.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { IStoredTokenData } from '@utils/global.type';
import {
  AuthResponseDto,
  LoginUserDto,
  SignupUserDto,
  UpdateProfileDto,
  UserResponseDto,
} from './user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post('signup')
  async signup(@Body() signupUserDto: SignupUserDto): Promise<AuthResponseDto> {
    return this.usersService.signup(signupUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    return this.usersService.login(loginUserDto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: IStoredTokenData): Promise<UserResponseDto> {
    return this.usersService.findOne(user.userId);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMe(
    @CurrentUser() user: IStoredTokenData,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(user.userId, dto);
  }
}
