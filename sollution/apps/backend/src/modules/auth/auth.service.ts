import { User } from '@database/entities/UserModel.model';
import { UserDbService } from '@database/services/user-db.service';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService as SharedAuthService } from '@shared/services/auth.service';
import { FirebaseAdminService } from '@shared/services/firebase-admin.service';
import {
  AuthResponseDto,
  FirebaseLoginDto,
  LoginUserDto,
  SignupUserDto,
} from './auth.dto';
import { UserResponseDto } from '../user/user.dto';

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
      throw new ConflictException('User with this email already exists.');
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
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await this.sharedAuth.matchHash(
      user.password,
      loginUserDto.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is disabled');
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
      throw new UnauthorizedException('Account is disabled');
    }

    return this.issueAuthResponse(
      user,
      user.email ?? firebaseUser.email ?? firebaseUser.uid,
    );
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
