import { User } from '@database/entities/UserModel.model';
import { UserDbService } from '@database/services/user-db.service';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService as SharedAuthService } from '@shared/services/auth.service';
import {
  AuthResponseDto,
  LoginUserDto,
  SignupUserDto,
} from './auth.dto';
import { UserResponseDto } from '../user/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userDbService: UserDbService,
    private readonly sharedAuth: SharedAuthService,
  ) {}

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
    });

    const { token, refreshToken } = await this.sharedAuth.generateAuthTokens(
      user.id,
      user.email ?? signupUserDto.email,
      Boolean(user.is_super_admin),
    );

    return {
      user: this.mapUser(user),
      token,
      refreshToken,
    };
  }

  async login(loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    const user = await this.userDbService.findByEmail(loginUserDto.email);
    if (!user) {
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

    const { token, refreshToken } = await this.sharedAuth.generateAuthTokens(
      user.id,
      user.email ?? loginUserDto.email,
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
