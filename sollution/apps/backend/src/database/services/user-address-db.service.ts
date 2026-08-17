import { UserAddress } from '@database/entities/UserAddress.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export type InsertUserAddressInput = {
  label: string;
  line1: string;
  line2: string;
  area: string;
  city: string;
  notes: string;
  lat: number;
  lng: number;
  isDefault: boolean;
  sortOrder: number;
};

@Injectable()
export class UserAddressDbService {
  constructor(
    @InjectRepository(UserAddress)
    private readonly addresses: Repository<UserAddress>,
  ) {}

  async listByUserIdOrdered(userId: string): Promise<UserAddress[]> {
    return this.addresses.find({
      where: { user_id: userId },
      order: { is_default: 'DESC', sort_order: 'ASC', created_at: 'ASC' },
    });
  }

  async findDefaultByUserId(userId: string): Promise<UserAddress | null> {
    return this.addresses.findOne({
      where: { user_id: userId, is_default: true },
    });
  }

  async insertForUser(
    userId: string,
    input: InsertUserAddressInput,
  ): Promise<UserAddress> {
    return this.addresses.manager.transaction(async (em) => {
      const repo = em.getRepository(UserAddress);
      const count = await repo.count({ where: { user_id: userId } });
      const isDefault = input.isDefault || count === 0;
      if (isDefault) {
        await repo.update(
          { user_id: userId, is_default: true },
          { is_default: false },
        );
      }
      return repo.save(
        repo.create({
          user_id: userId,
          label: input.label,
          line1: input.line1,
          line2: input.line2,
          area: input.area,
          city: input.city,
          notes: input.notes,
          lat: input.lat,
          lng: input.lng,
          is_default: isDefault,
          sort_order: input.sortOrder,
        }),
      );
    });
  }

  async setDefaultForUser(
    userId: string,
    addressId: string,
  ): Promise<UserAddress | null> {
    return this.addresses.manager.transaction(async (em) => {
      const repo = em.getRepository(UserAddress);
      const row = await repo.findOne({
        where: { id: addressId, user_id: userId },
      });
      if (!row) return null;
      if (row.is_default) return row;
      await repo.update(
        { user_id: userId, is_default: true },
        { is_default: false },
      );
      row.is_default = true;
      return repo.save(row);
    });
  }

  async updateForUser(
    userId: string,
    addressId: string,
    patch: Partial<
      Pick<
        InsertUserAddressInput,
        'label' | 'line1' | 'line2' | 'area' | 'city' | 'notes' | 'lat' | 'lng'
      >
    >,
  ): Promise<UserAddress | null> {
    const row = await this.addresses.findOne({
      where: { id: addressId, user_id: userId },
    });
    if (!row) return null;
    if (patch.label !== undefined) row.label = patch.label;
    if (patch.line1 !== undefined) row.line1 = patch.line1;
    if (patch.line2 !== undefined) row.line2 = patch.line2;
    if (patch.area !== undefined) row.area = patch.area;
    if (patch.city !== undefined) row.city = patch.city;
    if (patch.notes !== undefined) row.notes = patch.notes;
    if (patch.lat !== undefined) row.lat = patch.lat;
    if (patch.lng !== undefined) row.lng = patch.lng;
    return this.addresses.save(row);
  }

  async deleteForUser(userId: string, addressId: string): Promise<boolean> {
    return this.addresses.manager.transaction(async (em) => {
      const repo = em.getRepository(UserAddress);
      const row = await repo.findOne({
        where: { id: addressId, user_id: userId },
      });
      if (!row) return false;
      const wasDefault = row.is_default;
      await repo.remove(row);
      if (wasDefault) {
        const next = await repo.findOne({
          where: { user_id: userId },
          order: { sort_order: 'ASC', created_at: 'ASC' },
        });
        if (next) {
          next.is_default = true;
          await repo.save(next);
        }
      }
      return true;
    });
  }
}
