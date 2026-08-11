import { Body, Controller, Post } from '@nestjs/common';
import {
  AuthResponseDto,
  LoginUserDto,
  SignupUserDto,
} from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupUserDto): Promise<AuthResponseDto> {
    return this.authService.signup(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }
}
