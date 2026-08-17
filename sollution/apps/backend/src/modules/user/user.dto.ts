import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  contactPhone?: string | null;
}

export class UserResponseDto {
  id!: string;
  name?: string;
  email?: string;
  contactPhone!: string | null;
  is_super_admin!: boolean;
  is_active!: boolean;
  created_at!: Date;
}
