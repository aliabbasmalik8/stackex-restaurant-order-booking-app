import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Pickup branch / location.
 */
@Entity()
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Stable slug for seed upserts (e.g. `al-satwa`). */
  @Column({ unique: true })
  slug!: string;

  @Column()
  name!: string;

  @Column()
  name_arabic!: string;

  @Column({ type: 'text', default: '' })
  address!: string;

  @Column({ type: 'text', default: '' })
  address_arabic!: string;

  @Column({ type: 'int', default: 15 })
  eta_minutes!: number;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
