import { Type } from 'class-transformer';
import {
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { UserAddress } from '@database/entities/UserModel.model';

export class UserAddressDto {
  @IsString()
  line1!: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  contactPhone?: string | null;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @ValidateNested()
  @Type(() => UserAddressDto)
  @IsObject()
  address?: UserAddressDto | null;
}

export class UserResponseDto {
  id!: string;
  name?: string;
  email?: string;
  contactPhone!: string | null;
  address!: UserAddress | null;
  is_super_admin!: boolean;
  is_active!: boolean;
  created_at!: Date;
}
