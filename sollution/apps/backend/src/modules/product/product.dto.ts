import {
  ProductModifier,
} from '@database/entities/Product.model';

export class ProductResponseDto {
  id!: string;
  name!: string;
  name_arabic!: string;
  description!: string;
  description_arabic!: string;
  longDescription!: string;
  longDescription_arabic!: string;
  featuredSubtitle!: string | null;
  featuredSubtitle_arabic!: string | null;
  price!: number;
  categoryId!: string;
  branchId!: string;
  image!: string;
  featured!: boolean;
  badge!: string | null;
  badge_arabic!: string | null;
  calories!: number | null;
  available!: boolean;
  sortOrder!: number;
  modifiers!: ProductModifier[];
}
