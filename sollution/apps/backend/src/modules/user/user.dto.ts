import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SignupUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

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
