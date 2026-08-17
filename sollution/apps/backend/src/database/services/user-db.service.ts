import { User } from '@database/entities/UserModel.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/** Profile fields the user is allowed to change via API. */
export type UpdateUserProfileInput = {
  name?: string;
  contactPhone?: string | null;
};

@Injectable()
export class UserDbService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async create(payload: {
    name?: string;
    email?: string;
    password?: string | null;
    firebase_uid?: string | null;
  }): Promise<User> {
    return this.users.save({
      ...payload,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email } });
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.users.findOne({ where: { firebase_uid: firebaseUid } });
  }

  async findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  async linkFirebaseUid(
    id: string,
    firebaseUid: string,
  ): Promise<User | null> {
    const row = await this.findById(id);
    if (!row) return null;
    row.firebase_uid = firebaseUid;
    return this.users.save(row);
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

    return this.users.save(row);
  }

  /** Persist Stripe Customer id after create-or-get (card payments). */
  async setStripeCustomerId(
    id: string,
    stripeCustomerId: string,
  ): Promise<User | null> {
    const row = await this.findById(id);
    if (!row) return null;
    row.stripe_customer_id = stripeCustomerId;
    return this.users.save(row);
  }
}
