import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Fulfillment location / kitchen (delivery pin + optional coverage radius).
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

  /** Kitchen pin — required later for delivery assignment. */
  @Column({ type: 'double precision', nullable: true })
  lat!: number | null;

  @Column({ type: 'double precision', nullable: true })
  lng!: number | null;

  /** Override brand max radius (km). Null = use settings default later. */
  @Column({ type: 'double precision', nullable: true })
  delivery_radius_km!: number | null;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
