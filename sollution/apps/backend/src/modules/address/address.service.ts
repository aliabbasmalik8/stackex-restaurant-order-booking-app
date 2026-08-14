import { UserAddress } from '@database/entities/UserAddress.model';
import { UserAddressDbService } from '@database/services/user-address-db.service';
import { Injectable } from '@nestjs/common';
import {
  GoogleMapsService,
  GoogleReverseGeocodeResult,
} from '@shared/services/google-maps.service';
import {
  AddressResponseDto,
  CreateAddressDto,
  ReverseGeocodeDto,
} from './address.dto';

@Injectable()
export class AddressService {
  constructor(
    private readonly addressDb: UserAddressDbService,
    private readonly googleMaps: GoogleMapsService,
  ) {}

  async listForUser(userId: string): Promise<AddressResponseDto[]> {
    const rows = await this.addressDb.listByUserIdOrdered(userId);
    return rows.map((row) => this.map(row));
  }

  async createForUser(
    userId: string,
    dto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    const saved = await this.addressDb.insertForUser(userId, {
      label: dto.label.trim(),
      line1: dto.line1.trim(),
      line2: dto.line2?.trim() ?? '',
      area: dto.area?.trim() ?? '',
      city: dto.city.trim(),
      notes: dto.notes?.trim() ?? '',
      lat: dto.lat,
      lng: dto.lng,
      isDefault: dto.isDefault ?? false,
      sortOrder: dto.sortOrder ?? 0,
    });
    return this.map(saved);
  }

  /** Pin → English street fields (Google via `@shared` GoogleMapsService). */
  async reverseGeocode(
    dto: ReverseGeocodeDto,
  ): Promise<GoogleReverseGeocodeResult> {
    return this.googleMaps.reverseGeocode(dto.lat, dto.lng);
  }

  private map(row: UserAddress): AddressResponseDto {
    return {
      id: row.id,
      label: row.label,
      line1: row.line1,
      line2: row.line2,
      area: row.area,
      city: row.city,
      notes: row.notes,
      lat: row.lat,
      lng: row.lng,
      isDefault: row.is_default,
      sortOrder: row.sort_order,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}
