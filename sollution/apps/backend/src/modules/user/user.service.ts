import { User, UserAddress } from '@database/entities/UserModel.model';
import { UserDbService } from '@database/services/user-db.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '@shared/services/auth.service';
import {
  AuthResponseDto,
  LoginUserDto,
  SignupUserDto,
  UpdateProfileDto,
  UserResponseDto,
} from './user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userDbService: UserDbService,
    private readonly authService: AuthService,
  ) {}

  async signup(signupUserDto: SignupUserDto): Promise<AuthResponseDto> {
    const existingUser = await this.userDbService.findByEmail(
      signupUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    const hashedPassword = await this.authService.createHash(
      signupUserDto.password,
    );
    const user = await this.userDbService.create({
      name: signupUserDto.name,
      email: signupUserDto.email,
      password: hashedPassword,
    });

    const { token, refreshToken } = await this.authService.generateAuthTokens(
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

    const passwordMatches = await this.authService.matchHash(
      user.password,
      loginUserDto.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is disabled');
    }

    const { token, refreshToken } = await this.authService.generateAuthTokens(
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

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userDbService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return this.mapUser(user);
  }

  async updateProfile(
    id: string,
    dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.userDbService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const patch: {
      name?: string;
      contactPhone?: string | null;
      address?: UserAddress | null;
    } = {};

    if (dto.name !== undefined) {
      patch.name = dto.name.trim() || undefined;
    }

    if (dto.contactPhone !== undefined) {
      patch.contactPhone = dto.contactPhone?.trim() || null;
    }

    if (dto.address !== undefined) {
      if (dto.address === null) {
        patch.address = null;
      } else {
        const cleaned: UserAddress = {
          line1: dto.address.line1.trim(),
          city: dto.address.city.trim(),
        };
        if (dto.address.line2?.trim()) cleaned.line2 = dto.address.line2.trim();
        if (dto.address.area?.trim()) cleaned.area = dto.address.area.trim();
        if (dto.address.notes?.trim()) cleaned.notes = dto.address.notes.trim();
        patch.address = cleaned.line1 || cleaned.city ? cleaned : null;
      }
    }

    const updated = await this.userDbService.updateProfile(id, patch);
    if (!updated) {
      throw new NotFoundException('User not found.');
    }
    return this.mapUser(updated);
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
