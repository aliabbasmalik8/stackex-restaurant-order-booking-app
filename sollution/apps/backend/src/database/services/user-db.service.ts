import { User, UserAddress } from '@database/entities/UserModel.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/** Profile fields the user is allowed to change via API. */
export type UpdateUserProfileInput = {
  name?: string;
  contactPhone?: string | null;
  address?: UserAddress | null;
};

@Injectable()
export class UserDbService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async create(
    payload: Pick<User, 'name' | 'email' | 'password'>,
  ): Promise<User> {
    return this.users.save({
      ...payload,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  async setActiveStatus(id: string, isActive: boolean): Promise<void> {
    await this.users.update({ id }, { is_active: isActive });
  }

  async updateProfile(
    id: string,
    input: UpdateUserProfileInput,
  ): Promise<User | null> {
    const row = await this.findById(id);
    if (!row) return null;

    if (input.name !== undefined) {
      row.name = input.name;
    }
    if (input.contactPhone !== undefined) {
      row.contact_phone = input.contactPhone;
    }
    if (input.address !== undefined) {
      row.address = input.address;
    }

    return this.users.save(row);
  }
}
