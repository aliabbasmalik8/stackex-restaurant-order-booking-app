import { Injectable } from '@nestjs/common';
import { User } from '@database/entities/UserModel.model';
import { UserDbService } from '@database/services/user-db.service';

/**
 * Domain service for users. No HTTP controller yet — wire APIs later.
 */
@Injectable()
export class UserService {
  constructor(private readonly userDbService: UserDbService) {}

  create(payload: Pick<User, 'name' | 'email' | 'password'>): Promise<User> {
    return this.userDbService.create(payload);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userDbService.findByEmail(email);
  }

  findById(id: string): Promise<User | null> {
    return this.userDbService.findById(id);
  }
}
