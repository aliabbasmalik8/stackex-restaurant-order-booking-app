import { Body, Controller, Post } from '@nestjs/common';
import { handleControllerError } from '@utils/order-booking.exception';
import {
  AuthResponseDto,
  EmailAuthStatusDto,
  EmailAuthStatusResponseDto,
  FirebaseLoginDto,
  LoginUserDto,
  SignupUserDto,
} from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @deprecated Prefer Firebase Auth + `POST /auth/firebase`. Will be removed.
   */
  @Post('signup')
  async signup(@Body() dto: SignupUserDto): Promise<AuthResponseDto> {
    try {
      return await this.authService.signup(dto);
    } catch (error) {
      handleControllerError(error);
    }
  }

  /**
   * @deprecated Prefer Firebase Auth + `POST /auth/firebase`. Will be removed
   * (admin still depends on this temporarily).
   */
  @Post('login')
  async login(@Body() dto: LoginUserDto): Promise<AuthResponseDto> {
    try {
      return await this.authService.login(dto);
    } catch (error) {
      handleControllerError(error);
    }
  }

  /** Firebase ID token → Nest JWT session. Preferred auth entrypoint. */
  @Post('firebase')
  async loginWithFirebase(
    @Body() dto: FirebaseLoginDto,
  ): Promise<AuthResponseDto> {
    try {
      return await this.authService.loginWithFirebase(dto);
    } catch (error) {
      handleControllerError(error);
    }
  }

  /**
   * Logged-out: whether this email exists in Firebase Auth and has a password.
   * Always 200 with `status` — client then shows password, error, or sends reset mail.
   */
  @Post('email-status')
  async lookupEmailAuthStatus(
    @Body() dto: EmailAuthStatusDto,
  ): Promise<EmailAuthStatusResponseDto> {
    try {
      return await this.authService.lookupEmailAuthStatus(dto.email);
    } catch (error) {
      handleControllerError(error);
    }
  }
}
