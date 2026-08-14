import { User } from '@database/entities/UserModel.model';
import { UserDbService } from '@database/services/user-db.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthService as SharedAuthService } from '@shared/services/auth.service';
import { FirebaseAdminService } from '@shared/services/firebase-admin.service';
import { OrderBookingException } from '@utils/order-booking.exception';
import {
  AuthResponseDto,
  EmailAuthStatusResponseDto,
  FirebaseLoginDto,
  LoginUserDto,
  SignupUserDto,
} from './auth.dto';
import { UserResponseDto } from '../user/user.dto';

const ACCOUNT_DISABLED = {
  english: 'This account has been disabled.',
  arabic: 'تم تعطيل هذا الحساب.',
};

const INVALID_CREDENTIALS = {
  english: 'Invalid email or password.',
  arabic: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userDbService: UserDbService,
    private readonly sharedAuth: SharedAuthService,
    private readonly firebaseAdmin: FirebaseAdminService,
  ) {}

  /**
   * @deprecated Prefer `loginWithFirebase`. Nest-local signup will be removed.
   */
  async signup(signupUserDto: SignupUserDto): Promise<AuthResponseDto> {
    const existingUser = await this.userDbService.findByEmail(
      signupUserDto.email,
    );
    if (existingUser) {
      throw new OrderBookingException({
        error_detail: `Signup rejected: email already exists (${signupUserDto.email})`,
        user_error_detail: {
          english: 'An account with this email already exists.',
          arabic: 'يوجد حساب بهذا البريد الإلكتروني بالفعل.',
        },
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const hashedPassword = await this.sharedAuth.createHash(
      signupUserDto.password,
    );
    const user = await this.userDbService.create({
      name: signupUserDto.name,
      email: signupUserDto.email,
      password: hashedPassword,
      firebase_uid: null,
    });

    return this.issueAuthResponse(user, signupUserDto.email);
  }

  /**
   * @deprecated Prefer `loginWithFirebase`. Nest-local password login will be removed.
   */
  async login(loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    const user = await this.userDbService.findByEmail(loginUserDto.email);
    if (!user?.password) {
      throw new OrderBookingException({
        error_detail: `Login failed: no password user for ${loginUserDto.email}`,
        user_error_detail: INVALID_CREDENTIALS,
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    const passwordMatches = await this.sharedAuth.matchHash(
      user.password,
      loginUserDto.password,
    );
    if (!passwordMatches) {
      throw new OrderBookingException({
        error_detail: `Login failed: bad password for user ${user.id}`,
        user_error_detail: INVALID_CREDENTIALS,
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    if (!user.is_active) {
      throw new OrderBookingException({
        error_detail: `Login failed: user ${user.id} is inactive`,
        user_error_detail: ACCOUNT_DISABLED,
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    return this.issueAuthResponse(user, loginUserDto.email);
  }

  /**
   * Verify Firebase ID token → find or create Postgres user → Nest JWTs.
   */
  async loginWithFirebase(
    dto: FirebaseLoginDto,
  ): Promise<AuthResponseDto> {
    const firebaseUser = await this.firebaseAdmin.verifyIdToken(dto.idToken);

    let user = await this.userDbService.findByFirebaseUid(firebaseUser.uid);

    if (!user && firebaseUser.email) {
      const byEmail = await this.userDbService.findByEmail(firebaseUser.email);
      if (byEmail) {
        user =
          (await this.userDbService.linkFirebaseUid(
            byEmail.id,
            firebaseUser.uid,
          )) ?? byEmail;
      }
    }

    if (!user) {
      user = await this.userDbService.create({
        name: firebaseUser.name ?? undefined,
        email: firebaseUser.email ?? undefined,
        password: null,
        firebase_uid: firebaseUser.uid,
      });
    }

    if (!user.is_active) {
      throw new OrderBookingException({
        error_detail: `Firebase login failed: user ${user.id} is inactive`,
        user_error_detail: ACCOUNT_DISABLED,
        statusCode: HttpStatus.UNAUTHORIZED,
      });
    }

    return this.issueAuthResponse(
      user,
      user.email ?? firebaseUser.email ?? firebaseUser.uid,
    );
  }

  async lookupEmailAuthStatus(
    email: string,
  ): Promise<EmailAuthStatusResponseDto> {
    return this.firebaseAdmin.lookupEmailAuthStatus(email);
  }

  private async issueAuthResponse(
    user: User,
    emailFallback: string,
  ): Promise<AuthResponseDto> {
    const { token, refreshToken } = await this.sharedAuth.generateAuthTokens(
      user.id,
      user.email ?? emailFallback,
      Boolean(user.is_super_admin),
    );

    return {
      user: this.mapUser(user),
      token,
      refreshToken,
    };
  }

  private mapUser(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      contactPhone: user.contact_phone,
      address: user.address,
      is_super_admin: user.is_super_admin,
      is_active: user.is_active,
      created_at: user.created_at,
    };
  }
}
