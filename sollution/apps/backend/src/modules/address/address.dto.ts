import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class AddressResponseDto {
  id!: string;
  label!: string;
  line1!: string;
  line2!: string;
  area!: string;
  city!: string;
  notes!: string;
  lat!: number;
  lng!: number;
  isDefault!: boolean;
  sortOrder!: number;
  createdAt!: string;
  updatedAt!: string;
}

export class CreateAddressDto {
  @IsString()
  @MinLength(1)
  label!: string;

  @IsString()
  @MinLength(1)
  line1!: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsString()
  @MinLength(1)
  city!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  label?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  line1?: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  city?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;
}

/** Request body for `POST /addresses/reverse-geocode`. Response: `GoogleReverseGeocodeResult`. */
export class ReverseGeocodeDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;
}

/** Request body for `POST /addresses/place-autocomplete`. */
export class PlaceAutocompleteDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  query!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  /** Optional Google session token (pairs autocomplete + details for billing). */
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  sessionToken?: string;
}

/** Request body for `POST /addresses/place-details`. Response: `GoogleReverseGeocodeResult`. */
export class PlaceDetailsDto {
  @IsString()
  @MinLength(8)
  @MaxLength(256)
  placeId!: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  sessionToken?: string;
}
