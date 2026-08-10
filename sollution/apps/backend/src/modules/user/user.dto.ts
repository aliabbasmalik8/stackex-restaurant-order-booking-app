import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class UserResponseDto {
  id!: string;
  name?: string;
  email?: string;
  is_super_admin!: boolean;
  is_active!: boolean;
  created_at!: Date;
}

export class AuthResponseDto {
  user!: UserResponseDto;
  token!: string;
  refreshToken!: string;
}
