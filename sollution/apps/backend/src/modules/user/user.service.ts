import { User, UserAddress } from '@database/entities/UserModel.model';
import { UserDbService } from '@database/services/user-db.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileDto, UserResponseDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userDbService: UserDbService) {}

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userDbService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return this.mapUser(user);
  }

  async updateProfile(
    id: string,
    dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const user = await this.userDbService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const patch: {
      name?: string;
      contactPhone?: string | null;
      address?: UserAddress | null;
    } = {};

    if (dto.name !== undefined) {
      patch.name = dto.name.trim() || undefined;
    }

    if (dto.contactPhone !== undefined) {
      patch.contactPhone = dto.contactPhone?.trim() || null;
    }

    if (dto.address !== undefined) {
      if (dto.address === null) {
        patch.address = null;
      } else {
        const cleaned: UserAddress = {
          line1: dto.address.line1.trim(),
          city: dto.address.city.trim(),
        };
        if (dto.address.line2?.trim()) cleaned.line2 = dto.address.line2.trim();
        if (dto.address.area?.trim()) cleaned.area = dto.address.area.trim();
        if (dto.address.notes?.trim()) cleaned.notes = dto.address.notes.trim();
        patch.address = cleaned.line1 || cleaned.city ? cleaned : null;
      }
    }

    const updated = await this.userDbService.updateProfile(id, patch);
    if (!updated) {
      throw new NotFoundException('User not found.');
    }
    return this.mapUser(updated);
  }

  private mapUser(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      contactPhone: user.contact_phone,
      address: user.address,
      is_super_admin: user.is_super_admin,
      is_active: user.is_active,
      created_at: user.created_at,
    };
  }
}
