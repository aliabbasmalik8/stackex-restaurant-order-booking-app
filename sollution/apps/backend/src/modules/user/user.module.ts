import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@database/entities/UserModel.model';
import { UserDbService } from '@database/services/user-db.service';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserDbService, UserService],
  exports: [UserDbService, UserService],
})
export class UserModule {}
