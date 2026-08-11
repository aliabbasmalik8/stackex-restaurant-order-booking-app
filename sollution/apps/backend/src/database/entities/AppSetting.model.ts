import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type SettingValueType = 'string' | 'number' | 'boolean' | 'json';
export type SettingVisibility = 'public' | 'private';

/**
 * Key/value white-label overrides.
 * Types, visibility, and defaults live in the settings catalog (code);
 * rows here only store client-specific values.
 */
@Entity('app_setting')
export class AppSetting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  key!: string;

  @Column({ type: 'text' })
  value!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
