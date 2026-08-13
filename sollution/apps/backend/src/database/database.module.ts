import { AppSetting } from '@database/entities/AppSetting.model';
import { Branch } from '@database/entities/Branch.model';
import { Category } from '@database/entities/Category.model';
import { Order } from '@database/entities/Order.model';
import { Product } from '@database/entities/Product.model';
import { User } from '@database/entities/UserModel.model';
import { UserAddress } from '@database/entities/UserAddress.model';
import { BranchDbService } from '@database/services/branch-db.service';
import { CategoryDbService } from '@database/services/category-db.service';
import { OrderDbService } from '@database/services/order-db.service';
import { ProductDbService } from '@database/services/product-db.service';
import { SettingDbService } from '@database/services/setting-db.service';
import { UserAddressDbService } from '@database/services/user-address-db.service';
import { UserDbService } from '@database/services/user-db.service';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Sole persistence gateway. Feature modules inject `*DbService` only —
 * never `Repository` / QueryBuilder outside `src/database/services/`.
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserAddress,
      Order,
      AppSetting,
      Branch,
      Category,
      Product,
    ]),
  ],
  providers: [
    UserDbService,
    UserAddressDbService,
    OrderDbService,
    SettingDbService,
    BranchDbService,
    CategoryDbService,
    ProductDbService,
  ],
  exports: [
    UserDbService,
    UserAddressDbService,
    OrderDbService,
    SettingDbService,
    BranchDbService,
    CategoryDbService,
    ProductDbService,
  ],
})
export class DatabaseModule {}
