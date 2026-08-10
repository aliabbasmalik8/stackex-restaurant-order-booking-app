import { Product } from '@database/entities/Product.model';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductResponseDto } from './product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findAvailable(branchId?: string): Promise<ProductResponseDto[]> {
    const where = branchId
      ? { available: true, branch_id: branchId }
      : { available: true };

    const rows = await this.productRepo.find({
      where,
      order: { sort_order: 'ASC' },
    });
    return rows.map((row) => this.map(row));
  }

  async findById(id: string): Promise<ProductResponseDto> {
    const row = await this.productRepo.findOne({ where: { id } });
    if (!row || !row.available) {
      throw new NotFoundException('Product not found.');
    }
    return this.map(row);
  }

  private map(row: Product): ProductResponseDto {
    return {
      id: row.id,
      name: row.name,
      name_arabic: row.name_arabic,
      description: row.description,
      description_arabic: row.description_arabic,
      longDescription: row.long_description,
      longDescription_arabic: row.long_description_arabic,
      featuredSubtitle: row.featured_subtitle,
      featuredSubtitle_arabic: row.featured_subtitle_arabic,
      price: row.price,
      categoryId: row.category_id,
      branchId: row.branch_id,
      image: row.image,
      featured: row.featured,
      badge: row.badge,
      badge_arabic: row.badge_arabic,
      calories: row.calories,
      available: row.available,
      sortOrder: row.sort_order,
      modifiers: row.modifiers ?? [],
    };
  }
}
