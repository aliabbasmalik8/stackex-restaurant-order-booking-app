import { Product } from '@database/entities/Product.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

export type InsertProductInput = {
  slug: string;
  name: string;
  nameArabic: string;
  description: string;
  descriptionArabic: string;
  longDescription: string;
  longDescriptionArabic: string;
  featuredSubtitle: string | null;
  featuredSubtitleArabic: string | null;
  price: number;
  categoryId: string;
  branchId: string;
  image: string;
  featured: boolean;
  badge: string | null;
  badgeArabic: string | null;
  calories: number | null;
  available: boolean;
  sortOrder: number;
  modifiers: Product['modifiers'];
};

@Injectable()
export class ProductDbService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  async findById(id: string): Promise<Product | null> {
    return this.products.findOne({ where: { id } });
  }

  /** Batch lookup for checkout validation (order of results is undefined). */
  async findByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    return this.products.find({ where: { id: In(ids) } });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.products.findOne({ where: { slug } });
  }

  async listAvailable(branchId?: string): Promise<Product[]> {
    const where = branchId
      ? { available: true, branch_id: branchId }
      : { available: true };
    return this.products.find({
      where,
      order: { sort_order: 'ASC' },
    });
  }

  async listAll(branchId?: string): Promise<Product[]> {
    const where = branchId ? { branch_id: branchId } : {};
    return this.products.find({
      where,
      order: { sort_order: 'ASC' },
    });
  }

  async countByCategoryId(categoryId: string): Promise<number> {
    return this.products.count({ where: { category_id: categoryId } });
  }

  async insertProduct(input: InsertProductInput): Promise<Product> {
    return this.products.save(this.toRow(input));
  }

  async replaceProductContent(
    id: string,
    input: InsertProductInput,
  ): Promise<Product | null> {
    const row = await this.findById(id);
    if (!row) return null;
    Object.assign(row, this.toRow(input));
    return this.products.save(row);
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.products.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  private toRow(input: InsertProductInput): Partial<Product> {
    return {
      slug: input.slug,
      name: input.name,
      name_arabic: input.nameArabic,
      description: input.description,
      description_arabic: input.descriptionArabic,
      long_description: input.longDescription,
      long_description_arabic: input.longDescriptionArabic,
      featured_subtitle: input.featuredSubtitle,
      featured_subtitle_arabic: input.featuredSubtitleArabic,
      price: input.price,
      category_id: input.categoryId,
      branch_id: input.branchId,
      image: input.image,
      featured: input.featured,
      badge: input.badge,
      badge_arabic: input.badgeArabic,
      calories: input.calories,
      available: input.available,
      sort_order: input.sortOrder,
      modifiers: input.modifiers,
    };
  }
}
