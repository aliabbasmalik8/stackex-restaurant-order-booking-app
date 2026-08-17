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
}
