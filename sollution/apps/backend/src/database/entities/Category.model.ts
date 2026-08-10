import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Product } from './Product.model';

/**
 * Menu category.
 */
@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Stable slug for seed upserts (e.g. `shawarma`). */
  @Column({ unique: true })
  slug!: string;

  @Column()
  label!: string;

  @Column()
  label_arabic!: string;

  @Column({ type: 'int', default: 0 })
  sort_order!: number;

  @OneToMany(() => Product, (product) => product.category)
  products?: Product[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
