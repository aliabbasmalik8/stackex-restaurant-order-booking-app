import { Product } from '@database/entities/Product.model';
import { BranchDbService } from '@database/services/branch-db.service';
import { CategoryDbService } from '@database/services/category-db.service';
import {
  InsertProductInput,
  ProductDbService,
} from '@database/services/product-db.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    private readonly productDb: ProductDbService,
    private readonly categoryDb: CategoryDbService,
    private readonly branchDb: BranchDbService,
  ) {}

  async findAvailable(branchId?: string): Promise<ProductResponseDto[]> {
    const rows = await this.productDb.listAvailable(branchId);
    return rows.map((row) => this.map(row));
  }

  async findAll(branchId?: string): Promise<ProductResponseDto[]> {
    const rows = await this.productDb.listAll(branchId);
    return rows.map((row) => this.map(row));
  }

  async findById(
    id: string,
    requireAvailable = false,
  ): Promise<ProductResponseDto> {
    const row = await this.productDb.findById(id);
    if (!row || (requireAvailable && !row.available)) {
      throw new NotFoundException('Product not found.');
    }
    return this.map(row);
  }

  async create(dto: UpsertProductDto): Promise<ProductResponseDto> {
    await this.assertFks(dto.categoryId, dto.branchId);

    const slug = (dto.slug?.trim() || slugify(dto.name)).toLowerCase();
    if (!slug) throw new BadRequestException('Product slug is required.');

    const existing = await this.productDb.findBySlug(slug);
    if (existing) {
      throw new ConflictException('Product slug already exists.');
    }

    const saved = await this.productDb.insertProduct(this.toInput(dto, slug));
    return this.map(saved);
  }

  async update(
    id: string,
    dto: UpsertProductDto,
  ): Promise<ProductResponseDto> {
    const row = await this.productDb.findById(id);
    if (!row) throw new NotFoundException('Product not found.');

    await this.assertFks(dto.categoryId, dto.branchId);

    let slug = row.slug;
    if (dto.slug !== undefined) {
      const next = dto.slug.trim().toLowerCase();
      if (!next) throw new BadRequestException('Product slug is required.');
      if (next !== row.slug) {
        const clash = await this.productDb.findBySlug(next);
        if (clash) {
          throw new ConflictException('Product slug already exists.');
        }
        slug = next;
      }
    }

    const saved = await this.productDb.replaceProductContent(
      id,
      this.toInput(dto, slug),
    );
    if (!saved) throw new NotFoundException('Product not found.');
    return this.map(saved);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.productDb.deleteById(id);
    if (!deleted) throw new NotFoundException('Product not found.');
  }

  private async assertFks(categoryId: string, branchId: string): Promise<void> {
    const [category, branch] = await Promise.all([
      this.categoryDb.findById(categoryId),
      this.branchDb.findById(branchId),
    ]);
    if (!category) throw new BadRequestException('Invalid categoryId.');
    if (!branch) throw new BadRequestException('Invalid branchId.');
  }

  private toInput(dto: UpsertProductDto, slug: string): InsertProductInput {
    return {
      slug,
      name: dto.name.trim(),
      nameArabic: dto.name_arabic.trim(),
      description: dto.description?.trim() ?? '',
      descriptionArabic: dto.description_arabic?.trim() ?? '',
      longDescription: dto.longDescription?.trim() ?? '',
      longDescriptionArabic: dto.longDescription_arabic?.trim() ?? '',
      featuredSubtitle: dto.featuredSubtitle?.trim() || null,
      featuredSubtitleArabic: dto.featuredSubtitle_arabic?.trim() || null,
      price: dto.price,
      categoryId: dto.categoryId,
      branchId: dto.branchId,
      image: dto.image?.trim() ?? '',
      featured: dto.featured ?? false,
      badge: dto.badge?.trim() || null,
      badgeArabic: dto.badge_arabic?.trim() || null,
      calories: dto.calories ?? null,
      available: dto.available ?? true,
      sortOrder: dto.sortOrder ?? 0,
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
