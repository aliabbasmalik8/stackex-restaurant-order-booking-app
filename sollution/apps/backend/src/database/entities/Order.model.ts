import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'card';

export type PaymentStatus =
  | 'not_required'
  | 'unpaid'
  | 'paid'
  | 'failed'
  | 'cancelled';

/** Contact snapshot at checkout. */
export interface OrderContactSnapshot {
  name: string;
  name_arabic?: string;
  phone: string;
}

/** Customer address snapshot. */
export interface OrderCustomerAddressSnapshot {
  line1: string;
  line2?: string;
  area?: string;
  city: string;
  notes?: string;
  /** Delivery pin copied at checkout (older orders may omit). */
  lat?: number;
  lng?: number;
}

/**
 * Line-item snapshot — cloned product/cart data at purchase time.
 * Not a relation to `product`.
 */
export interface OrderItemSnapshot {
  id: string;
  menuItemId: string;
  name: string;
  name_arabic: string;
  image: string;
  unitPrice: number;
  quantity: number;
  optionsSummary: string;
  optionsSummary_arabic: string;
  selectedOptionIds: string[];
  specialInstructions?: string;
}

/**
 * Pickup order.
 * User/product details that must survive later catalog edits are stored as jsonb snapshots.
 */
@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Owning user id (query only — display name/phone live in `contact` jsonb). */
  @Index()
  @Column({ type: 'uuid' })
  user_id!: string;

  /** Kitchen ticket number. Postgres IDENTITY — do not set on insert. */
  @Column({ type: 'int', unique: true, generated: 'increment' })
  order_code!: number;

  @Column({ type: 'varchar', default: 'pending' })
  status!: OrderStatus;

  @Column({ type: 'varchar', nullable: true })
  ready_around!: string | null;

  /** Optional branch id at order time (label/address also snapshotted below). */
  @Column({ type: 'uuid', nullable: true })
  branch_id!: string | null;

  @Column()
  branch_label!: string;

  @Column()
  branch_label_arabic!: string;

  /** Branch / pickup location text (cloned). */
  @Column({ type: 'text', default: '' })
  address!: string;

  @Column({ type: 'text', default: '' })
  address_arabic!: string;

  @Column({ type: 'jsonb', nullable: true })
  customer_address!: OrderCustomerAddressSnapshot | null;

  /** Cloned cart / product lines at checkout. */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  items!: OrderItemSnapshot[];

  @Column({ type: 'double precision', default: 0 })
  subtotal!: number;

  @Column({ type: 'double precision', default: 0 })
  vat!: number;

  @Column({ type: 'double precision', default: 0 })
  total!: number;

  /** Cloned customer contact at checkout. */
  @Column({ type: 'jsonb' })
  contact!: OrderContactSnapshot;

  @Column({ type: 'varchar', default: 'cash' })
  payment_method!: PaymentMethod;

  @Column({ type: 'varchar', default: 'not_required' })
  payment_status!: PaymentStatus;

  @Column({ type: 'varchar', nullable: true })
  stripe_payment_intent_id!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  paid_at!: Date | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
