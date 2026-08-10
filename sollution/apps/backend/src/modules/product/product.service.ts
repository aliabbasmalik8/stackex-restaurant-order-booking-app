import { Branch } from '@database/entities/Branch.model';
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
import { ProductResponseDto, UpsertProductDto } from './product.dto';

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
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

  async findAll(branchId?: string): Promise<ProductResponseDto[]> {
    const where = branchId ? { branch_id: branchId } : {};
    const rows = await this.productRepo.find({
      where,
      order: { sort_order: 'ASC' },
    });
    return rows.map((row) => this.map(row));
  }

  async findById(id: string, requireAvailable = false): Promise<ProductResponseDto> {
    const row = await this.productRepo.findOne({ where: { id } });
    if (!row || (requireAvailable && !row.available)) {
      throw new NotFoundException('Product not found.');
    }
    return this.map(row);
  }

  async create(dto: UpsertProductDto): Promise<ProductResponseDto> {
    await this.assertFks(dto.categoryId, dto.branchId);

    const slug = (dto.slug?.trim() || slugify(dto.name)).toLowerCase();
    if (!slug) throw new BadRequestException('Product slug is required.');

    const existing = await this.productRepo.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException('Product slug already exists.');
    }

    const saved = await this.productRepo.save(this.toEntity(dto, slug));
    return this.map(saved);
  }

  async update(
    id: string,
    dto: UpsertProductDto,
  ): Promise<ProductResponseDto> {
    const row = await this.productRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Product not found.');

    await this.assertFks(dto.categoryId, dto.branchId);

    if (dto.slug !== undefined) {
      const slug = dto.slug.trim().toLowerCase();
      if (!slug) throw new BadRequestException('Product slug is required.');
      if (slug !== row.slug) {
        const clash = await this.productRepo.findOne({ where: { slug } });
        if (clash) {
          throw new ConflictException('Product slug already exists.');
        }
        row.slug = slug;
      }
    }

    Object.assign(row, this.toEntity(dto, row.slug));
    const saved = await this.productRepo.save(row);
    return this.map(saved);
  }

  async remove(id: string): Promise<void> {
    const row = await this.productRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Product not found.');
    await this.productRepo.delete({ id });
  }

  private async assertFks(categoryId: string, branchId: string): Promise<void> {
    const [category, branch] = await Promise.all([
      this.categoryRepo.findOne({ where: { id: categoryId } }),
      this.branchRepo.findOne({ where: { id: branchId } }),
    ]);
    if (!category) throw new BadRequestException('Invalid categoryId.');
    if (!branch) throw new BadRequestException('Invalid branchId.');
  }

  private toEntity(
    dto: UpsertProductDto,
    slug: string,
  ): Partial<Product> {
    return {
      slug,
      name: dto.name.trim(),
      name_arabic: dto.name_arabic.trim(),
      description: dto.description?.trim() ?? '',
      description_arabic: dto.description_arabic?.trim() ?? '',
      long_description: dto.longDescription?.trim() ?? '',
      long_description_arabic: dto.longDescription_arabic?.trim() ?? '',
      featured_subtitle: dto.featuredSubtitle?.trim() || null,
      featured_subtitle_arabic: dto.featuredSubtitle_arabic?.trim() || null,
      price: dto.price,
      category_id: dto.categoryId,
      branch_id: dto.branchId,
      image: dto.image?.trim() ?? '',
      featured: dto.featured ?? false,
      badge: dto.badge?.trim() || null,
      badge_arabic: dto.badge_arabic?.trim() || null,
      calories: dto.calories ?? null,
      available: dto.available ?? true,
      sort_order: dto.sortOrder ?? 0,
      modifiers: dto.modifiers ?? [],
    };
  }

  private map(row: Product): ProductResponseDto {
    return {
      id: row.id,
      slug: row.slug,
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
