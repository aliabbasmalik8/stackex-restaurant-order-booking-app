import { Product } from '@database/entities/Product.model';
import { CategoryDbService } from '@database/services/category-db.service';
import {
  InsertProductInput,
  ProductDbService,
} from '@database/services/product-db.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { OrderBookingException } from '@utils/order-booking.exception';
import { ProductResponseDto, UpsertProductDto } from './product.dto';

const PRODUCT_NOT_FOUND = {
  english: 'Product not found.',
  arabic: 'المنتج غير موجود.',
};

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
  ) {}

  async findAvailable(): Promise<ProductResponseDto[]> {
    const rows = await this.productDb.listAvailable();
    return rows.map((row) => this.map(row));
  }

  async findAll(): Promise<ProductResponseDto[]> {
    const rows = await this.productDb.listAll();
    return rows.map((row) => this.map(row));
  }

  async findById(
    id: string,
    requireAvailable = false,
  ): Promise<ProductResponseDto> {
    const row = await this.productDb.findById(id);
    if (!row || (requireAvailable && !row.available)) {
      throw new OrderBookingException({
        error_detail: !row
          ? `Product ${id} not found`
          : `Product ${id} not available`,
        user_error_detail: PRODUCT_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return this.map(row);
  }

  async create(dto: UpsertProductDto): Promise<ProductResponseDto> {
    await this.assertCategory(dto.categoryId);

    const slug = (dto.slug?.trim() || slugify(dto.name)).toLowerCase();
    if (!slug) {
      throw new OrderBookingException({
        error_detail: 'Product create rejected: empty slug',
        user_error_detail: {
          english: 'Please provide a valid product name.',
          arabic: 'يرجى إدخال اسم منتج صالح.',
        },
      });
    }

    const existing = await this.productDb.findBySlug(slug);
    if (existing) {
      throw new OrderBookingException({
        error_detail: `Product slug already exists: ${slug}`,
        user_error_detail: {
          english: 'A product with this name already exists.',
          arabic: 'يوجد منتج بهذا الاسم بالفعل.',
        },
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const saved = await this.productDb.insertProduct(this.toInput(dto, slug));
    return this.map(saved);
  }

  async update(
    id: string,
    dto: UpsertProductDto,
  ): Promise<ProductResponseDto> {
    const row = await this.productDb.findById(id);
    if (!row) {
      throw new OrderBookingException({
        error_detail: `Product ${id} not found before update`,
        user_error_detail: PRODUCT_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    await this.assertCategory(dto.categoryId);

    let slug = row.slug;
    if (dto.slug !== undefined) {
      const next = dto.slug.trim().toLowerCase();
      if (!next) {
        throw new OrderBookingException({
          error_detail: `Product ${id} update rejected: empty slug`,
          user_error_detail: {
            english: 'Please provide a valid product name.',
            arabic: 'يرجى إدخال اسم منتج صالح.',
          },
        });
      }
      if (next !== row.slug) {
        const clash = await this.productDb.findBySlug(next);
        if (clash) {
          throw new OrderBookingException({
            error_detail: `Product slug already exists: ${next}`,
            user_error_detail: {
              english: 'A product with this name already exists.',
              arabic: 'يوجد منتج بهذا الاسم بالفعل.',
            },
            statusCode: HttpStatus.CONFLICT,
          });
        }
        slug = next;
      }
    }

    const saved = await this.productDb.replaceProductContent(
      id,
      this.toInput(dto, slug),
    );
    if (!saved) {
      throw new OrderBookingException({
        error_detail: `Product ${id} missing after replaceProductContent`,
        user_error_detail: PRODUCT_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return this.map(saved);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.productDb.deleteById(id);
    if (!deleted) {
      throw new OrderBookingException({
        error_detail: `Product ${id} not found before delete`,
        user_error_detail: PRODUCT_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
  }

  private async assertCategory(categoryId: string): Promise<void> {
    const category = await this.categoryDb.findById(categoryId);
    if (!category) {
      throw new OrderBookingException({
        error_detail: `Invalid categoryId ${categoryId}`,
        user_error_detail: {
          english: 'Please choose a valid category.',
          arabic: 'يرجى اختيار تصنيف صالح.',
        },
      });
    }
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
