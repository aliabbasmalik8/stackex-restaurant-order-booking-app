import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

/** Keep `null` (clear pin) vs omit (`undefined`, leave unchanged). */
function toOptionalNullableNumber({ value }: { value: unknown }) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : value;
}

export class BranchResponseDto {
  id!: string;
  slug!: string;
  name!: string;
  name_arabic!: string;
  address!: string;
  address_arabic!: string;
  etaMinutes!: number;
  lat!: number | null;
  lng!: number | null;
  deliveryRadiusKm!: number | null;
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
  @Transform(toOptionalNullableNumber)
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number | null;

  @IsOptional()
  @Transform(toOptionalNullableNumber)
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number | null;

  @IsOptional()
  @Transform(toOptionalNullableNumber)
  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsNumber()
  @Min(0)
  deliveryRadiusKm?: number | null;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
