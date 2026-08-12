import { Category } from '@database/entities/Category.model';
import { CategoryDbService } from '@database/services/category-db.service';
import { ProductDbService } from '@database/services/product-db.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { OrderBookingException } from '@utils/order-booking.exception';
import { CategoryResponseDto, UpsertCategoryDto } from './category.dto';

const PROTECTED_SLUGS = new Set(['all']);

const CATEGORY_NOT_FOUND = {
  english: 'Category not found.',
  arabic: 'التصنيف غير موجود.',
};

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
    private readonly categoryDb: CategoryDbService,
    private readonly productDb: ProductDbService,
  ) {}

  async findAll(): Promise<CategoryResponseDto[]> {
    const rows = await this.categoryDb.listOrdered();
    return rows.map((row) => this.map(row));
  }

  async findById(id: string): Promise<CategoryResponseDto> {
    const row = await this.categoryDb.findById(id);
    if (!row) {
      throw new OrderBookingException({
        error_detail: `Category ${id} not found`,
        user_error_detail: CATEGORY_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return this.map(row);
  }

  async create(dto: UpsertCategoryDto): Promise<CategoryResponseDto> {
    const slug = (dto.slug?.trim() || slugify(dto.label)).toLowerCase();
    if (!slug) {
      throw new OrderBookingException({
        error_detail: 'Category create rejected: empty slug',
        user_error_detail: {
          english: 'Please provide a valid category name.',
          arabic: 'يرجى إدخال اسم تصنيف صالح.',
        },
      });
    }
    if (PROTECTED_SLUGS.has(slug)) {
      throw new OrderBookingException({
        error_detail: `Category create rejected: reserved slug "${slug}"`,
        user_error_detail: {
          english: 'This category name is reserved. Please choose another.',
          arabic: 'اسم التصنيف هذا محجوز. يرجى اختيار اسم آخر.',
        },
      });
    }

    const existing = await this.categoryDb.findBySlug(slug);
    if (existing) {
      throw new OrderBookingException({
        error_detail: `Category slug already exists: ${slug}`,
        user_error_detail: {
          english: 'A category with this name already exists.',
          arabic: 'يوجد تصنيف بهذا الاسم بالفعل.',
        },
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const saved = await this.categoryDb.insertCategory({
      slug,
      label: dto.label.trim(),
      labelArabic: dto.label_arabic.trim(),
      sortOrder: dto.sortOrder ?? 0,
    });
    return this.map(saved);
  }

  async update(
    id: string,
    dto: UpsertCategoryDto,
  ): Promise<CategoryResponseDto> {
    const row = await this.categoryDb.findById(id);
    if (!row) {
      throw new OrderBookingException({
        error_detail: `Category ${id} not found before update`,
        user_error_detail: CATEGORY_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    let nextSlug: string | undefined;
    if (dto.slug !== undefined) {
      const slug = dto.slug.trim().toLowerCase();
      if (!slug) {
        throw new OrderBookingException({
          error_detail: `Category ${id} update rejected: empty slug`,
          user_error_detail: {
            english: 'Please provide a valid category name.',
            arabic: 'يرجى إدخال اسم تصنيف صالح.',
          },
        });
      }
      if (PROTECTED_SLUGS.has(slug)) {
        throw new OrderBookingException({
          error_detail: `Category ${id} update rejected: reserved slug "${slug}"`,
          user_error_detail: {
            english: 'This category name is reserved. Please choose another.',
            arabic: 'اسم التصنيف هذا محجوز. يرجى اختيار اسم آخر.',
          },
        });
      }
      if (slug !== row.slug) {
        const clash = await this.categoryDb.findBySlug(slug);
        if (clash) {
          throw new OrderBookingException({
            error_detail: `Category slug already exists: ${slug}`,
            user_error_detail: {
              english: 'A category with this name already exists.',
              arabic: 'يوجد تصنيف بهذا الاسم بالفعل.',
            },
            statusCode: HttpStatus.CONFLICT,
          });
        }
        nextSlug = slug;
      }
    }

    const saved = await this.categoryDb.updateCategoryContent(id, {
      slug: nextSlug,
      label: dto.label.trim(),
      labelArabic: dto.label_arabic.trim(),
      sortOrder: dto.sortOrder,
    });
    if (!saved) {
      throw new OrderBookingException({
        error_detail: `Category ${id} missing after updateCategoryContent`,
        user_error_detail: CATEGORY_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return this.map(saved);
  }

  async remove(id: string): Promise<void> {
    const row = await this.categoryDb.findById(id);
    if (!row) {
      throw new OrderBookingException({
        error_detail: `Category ${id} not found before delete`,
        user_error_detail: CATEGORY_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    if (PROTECTED_SLUGS.has(row.slug)) {
      throw new OrderBookingException({
        error_detail: `Protected category cannot be deleted: ${row.slug}`,
        user_error_detail: {
          english: 'This category cannot be deleted.',
          arabic: 'لا يمكن حذف هذا التصنيف.',
        },
      });
    }

    const inUse = await this.productDb.countByCategoryId(id);
    if (inUse > 0) {
      throw new OrderBookingException({
        error_detail: `Category ${id} in use by ${inUse} product(s)`,
        user_error_detail: {
          english: 'This category is used by products and cannot be deleted.',
          arabic: 'هذا التصنيف مستخدم في منتجات ولا يمكن حذفه.',
        },
        statusCode: HttpStatus.CONFLICT,
        // Admin client keys off message + count on 409.
        error_data: {
          message: 'CATEGORY_IN_USE',
          count: inUse,
        },
      });
    }

    await this.categoryDb.deleteById(id);
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
