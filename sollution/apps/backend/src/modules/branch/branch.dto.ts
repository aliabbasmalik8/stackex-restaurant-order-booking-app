import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class BranchResponseDto {
  id!: string;
  slug!: string;
  name!: string;
  name_arabic!: string;
  address!: string;
  address_arabic!: string;
  etaMinutes!: number;
  active!: boolean;
  sortOrder!: number;
}

/** Admin edit only — create/delete stay seed/script for now. */
export class UpdateBranchDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  name_arabic!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  address_arabic?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  etaMinutes?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
