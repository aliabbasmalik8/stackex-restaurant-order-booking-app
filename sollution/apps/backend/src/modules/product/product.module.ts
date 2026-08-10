import { Branch } from '@database/entities/Branch.model';
import { Category } from '@database/entities/Category.model';
import { Product } from '@database/entities/Product.model';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Branch])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
