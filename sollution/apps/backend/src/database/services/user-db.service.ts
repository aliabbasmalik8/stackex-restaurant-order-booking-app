import { User } from '@database/entities/UserModel.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserDbService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(
    payload: Pick<User, 'name' | 'email' | 'password'>,
  ): Promise<User> {
    return this.usersRepository.save({
      ...payload,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async setActiveStatus(id: string, isActive: boolean): Promise<void> {
    await this.usersRepository.update({ id }, { is_active: isActive });
  }

  async update(id: string, patch: Partial<User>): Promise<User> {
    await this.usersRepository.update({ id }, patch);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`User ${id} not found after update`);
    }
    return updated;
  }
}
