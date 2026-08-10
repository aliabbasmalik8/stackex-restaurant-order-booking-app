import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CategoryResponseDto {
  id!: string;
  slug!: string;
  label!: string;
  label_arabic!: string;
  sortOrder!: number;
}

export class UpsertCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  slug?: string;

  @IsString()
  @MinLength(1)
  label!: string;

  @IsString()
  label_arabic!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
