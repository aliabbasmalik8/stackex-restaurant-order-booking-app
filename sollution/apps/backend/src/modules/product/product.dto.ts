import {
  ProductModifier,
} from '@database/entities/Product.model';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ProductResponseDto {
  id!: string;
  slug!: string;
  name!: string;
  name_arabic!: string;
  description!: string;
  description_arabic!: string;
  longDescription!: string;
  longDescription_arabic!: string;
  featuredSubtitle!: string | null;
  featuredSubtitle_arabic!: string | null;
  price!: number;
  categoryId!: string;
  branchId!: string;
  image!: string;
  featured!: boolean;
  badge!: string | null;
  badge_arabic!: string | null;
  calories!: number | null;
  available!: boolean;
  sortOrder!: number;
  modifiers!: ProductModifier[];
}

export class UpsertProductDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  name_arabic!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  description_arabic?: string;

  @IsOptional()
  @IsString()
  longDescription?: string;

  @IsOptional()
  @IsString()
  longDescription_arabic?: string;

  @IsOptional()
  @IsString()
  featuredSubtitle?: string | null;

  @IsOptional()
  @IsString()
  featuredSubtitle_arabic?: string | null;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsUUID()
  categoryId!: string;

  @IsUUID()
  branchId!: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  badge?: string | null;

  @IsOptional()
  @IsString()
  badge_arabic?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  calories?: number | null;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  modifiers?: ProductModifier[];
}
