import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './UserModel.model';

/**
 * Saved delivery address for a user (book of places, with map pin).
 * Distinct from `user.address` jsonb (legacy single snapshot).
 */
@Entity({ name: 'user_address' })
@Index('user_address_one_default_per_user', ['user_id'], {
  unique: true,
  where: '"is_default" = true',
})
export class UserAddress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  user_id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  /** Guest-facing label, e.g. Home / Work. */
  @Column()
  label!: string;

  @Column({ type: 'text' })
  line1!: string;

  @Column({ type: 'text', default: '' })
  line2!: string;

  @Column({ type: 'text', default: '' })
  area!: string;

  @Column()
  city!: string;

  @Column({ type: 'text', default: '' })
  notes!: string;

  @Column({ type: 'double precision' })
  lat!: number;

  @Column({ type: 'double precision' })
  lng!: number;

  @Column({ type: 'boolean', default: false })
  is_default!: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
