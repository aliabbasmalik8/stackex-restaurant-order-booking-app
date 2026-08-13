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

  /**
   * @deprecated Nest-local password hash. Guest auth is Firebase; this column
   * remains for admin / legacy Nest `/auth/login` until those move to Firebase.
   * Planned for removal.
   */
  @Column({ type: 'varchar', nullable: true })
  password!: string | null;

  /** Firebase Auth uid — set when the user signs in via Firebase. */
  @Column({ type: 'varchar', nullable: true, unique: true })
  firebase_uid!: string | null;

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

  /** Legacy single profile address. Saved book is `user_address`. */
  @Column({ type: 'jsonb', nullable: true })
  address!: UserAddress | null;

  /**
   * Stripe Customer id (`cus_…`) — created lazily on first card PaymentIntent.
   * Not exposed on public profile DTOs.
   */
  @Column({ type: 'varchar', nullable: true, unique: true })
  stripe_customer_id!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
