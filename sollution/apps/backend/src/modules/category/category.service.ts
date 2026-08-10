import { Category } from '@database/entities/Category.model';
import { Product } from '@database/entities/Product.model';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryResponseDto, UpsertCategoryDto } from './category.dto';

const PROTECTED_SLUGS = new Set(['all']);

function slugify(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findAll(): Promise<CategoryResponseDto[]> {
    const rows = await this.categoryRepo.find({
      order: { sort_order: 'ASC' },
    });
    return rows.map((row) => this.map(row));
  }

  async findById(id: string): Promise<CategoryResponseDto> {
    const row = await this.categoryRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Category not found.');
    return this.map(row);
  }

  async create(dto: UpsertCategoryDto): Promise<CategoryResponseDto> {
    const slug = (dto.slug?.trim() || slugify(dto.label)).toLowerCase();
    if (!slug) throw new BadRequestException('Category slug is required.');
    if (PROTECTED_SLUGS.has(slug)) {
      throw new BadRequestException('This category slug is reserved.');
    }

    const existing = await this.categoryRepo.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException('Category slug already exists.');
    }

    const saved = await this.categoryRepo.save({
      slug,
      label: dto.label.trim(),
      label_arabic: dto.label_arabic.trim(),
      sort_order: dto.sortOrder ?? 0,
    });
    return this.map(saved);
  }

  async update(
    id: string,
    dto: UpsertCategoryDto,
  ): Promise<CategoryResponseDto> {
    const row = await this.categoryRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Category not found.');

    if (dto.slug !== undefined) {
      const slug = dto.slug.trim().toLowerCase();
      if (!slug) throw new BadRequestException('Category slug is required.');
      if (PROTECTED_SLUGS.has(slug)) {
        throw new BadRequestException('This category slug is reserved.');
      }
      if (slug !== row.slug) {
        const clash = await this.categoryRepo.findOne({ where: { slug } });
        if (clash) {
          throw new ConflictException('Category slug already exists.');
        }
        row.slug = slug;
      }
    }

    row.label = dto.label.trim();
    row.label_arabic = dto.label_arabic.trim();
    if (dto.sortOrder !== undefined) row.sort_order = dto.sortOrder;

    const saved = await this.categoryRepo.save(row);
    return this.map(saved);
  }

  async remove(id: string): Promise<void> {
    const row = await this.categoryRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Category not found.');
    if (PROTECTED_SLUGS.has(row.slug)) {
      throw new BadRequestException('This category cannot be deleted.');
    }

    const inUse = await this.productRepo.count({
      where: { category_id: id },
    });
    if (inUse > 0) {
      throw new ConflictException({
        message: 'CATEGORY_IN_USE',
        count: inUse,
      });
    }

    await this.categoryRepo.delete({ id });
  }

  private map(row: Category): CategoryResponseDto {
    return {
      id: row.id,
      slug: row.slug,
      label: row.label,
      label_arabic: row.label_arabic,
      sortOrder: row.sort_order,
    };
  }
}
