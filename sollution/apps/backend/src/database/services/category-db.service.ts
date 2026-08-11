import { Category } from '@database/entities/Category.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export type InsertCategoryInput = {
  slug: string;
  label: string;
  labelArabic: string;
  sortOrder: number;
};

export type UpdateCategoryContentInput = {
  slug?: string;
  label: string;
  labelArabic: string;
  sortOrder?: number;
};

@Injectable()
export class CategoryDbService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async findById(id: string): Promise<Category | null> {
    return this.categories.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.categories.findOne({ where: { slug } });
  }

  async listOrdered(): Promise<Category[]> {
    return this.categories.find({
      order: { sort_order: 'ASC' },
    });
  }

  async insertCategory(input: InsertCategoryInput): Promise<Category> {
    return this.categories.save({
      slug: input.slug,
      label: input.label,
      label_arabic: input.labelArabic,
      sort_order: input.sortOrder,
    });
  }

  async updateCategoryContent(
    id: string,
    input: UpdateCategoryContentInput,
  ): Promise<Category | null> {
    const row = await this.findById(id);
    if (!row) return null;
    if (input.slug !== undefined) row.slug = input.slug;
    row.label = input.label;
    row.label_arabic = input.labelArabic;
    if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
    return this.categories.save(row);
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.categories.delete({ id });
    return (result.affected ?? 0) > 0;
  }
}
