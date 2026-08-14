import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserResponseDto } from '../user/user.dto';

/**
 * @deprecated Use Firebase Auth on the client + `POST /auth/firebase`.
 * Nest email/password signup will be removed.
 */
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

/**
 * @deprecated Use Firebase Auth on the client + `POST /auth/firebase`.
 * Nest email/password login will be removed (admin still uses it temporarily).
 */
export class LoginUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

/** Exchange a Firebase ID token for Nest JWTs. Preferred auth entrypoint. */
export class FirebaseLoginDto {
  @IsString()
  idToken!: string;
}

export class AuthResponseDto {
  user!: UserResponseDto;
  token!: string;
  refreshToken!: string;
}

export class EmailAuthStatusDto {
  @IsEmail()
  email!: string;
}

export class EmailAuthStatusResponseDto {
  status!: 'ok' | 'account-not-exist' | 'password-reset-required';
}
