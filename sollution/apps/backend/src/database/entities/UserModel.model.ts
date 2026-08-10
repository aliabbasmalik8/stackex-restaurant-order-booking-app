import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

/**
 * Creates the `user` table in the database.
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

  @CreateDateColumn()
  created_at!: Date;
}
