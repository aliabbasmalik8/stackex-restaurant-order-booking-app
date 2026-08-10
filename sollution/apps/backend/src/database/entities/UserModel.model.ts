import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Address snapshot on the user profile. */
export interface UserAddress {
  line1: string;
  line2?: string;
  area?: string;
  city: string;
  notes?: string;
}

/**
 * App user (auth + profile).
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    nullable: true,
  })
  name?: string;

  @Column({
    unique: true,
    nullable: true,
  })
  email?: string;

  @Column()
  password!: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_super_admin!: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  is_active!: boolean;

  /** Contact phone. */
  @Column({ type: 'varchar', nullable: true })
  contact_phone!: string | null;

  /** Delivery / profile address. */
  @Column({ type: 'jsonb', nullable: true })
  address!: UserAddress | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
