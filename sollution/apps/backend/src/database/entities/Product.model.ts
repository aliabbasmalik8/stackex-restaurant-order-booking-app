import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from './Category.model';

/** Modifier option nested under a product modifier group. */
export interface ProductModifierOption {
  id: string;
  label: string;
  label_arabic: string;
  price: number;
  hint?: string;
  hint_arabic?: string;
}

/** Modifier group on a product. */
export interface ProductModifier {
  id: string;
  label: string;
  label_arabic: string;
  required: boolean;
  type: 'single' | 'multi';
  options: ProductModifierOption[];
}

/**
 * Menu product / dish.
 */
@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Stable slug for seed upserts (e.g. `chicken-shawarma`). */
  @Column({ unique: true })
  slug!: string;

  @Column()
  name!: string;

  @Column()
  name_arabic!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'text', default: '' })
  description_arabic!: string;

  @Column({ type: 'text', default: '' })
  long_description!: string;

  @Column({ type: 'text', default: '' })
  long_description_arabic!: string;

  @Column({ type: 'text', nullable: true })
  featured_subtitle!: string | null;

  @Column({ type: 'text', nullable: true })
  featured_subtitle_arabic!: string | null;

  @Column({ type: 'double precision' })
  price!: number;

  @Column({ type: 'uuid' })
  category_id!: string;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @Column({ type: 'text', default: '' })
  image!: string;

  @Column({ type: 'boolean', default: false })
  featured!: boolean;

  @Column({ type: 'varchar', nullable: true })
  badge!: string | null;

  @Column({ type: 'varchar', nullable: true })
  badge_arabic!: string | null;

  @Column({ type: 'int', nullable: true })
  calories!: number | null;

  @Column({ type: 'boolean', default: true })
  available!: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order!: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  modifiers!: ProductModifier[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
