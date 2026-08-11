import {
  Order,
  OrderContactSnapshot,
  OrderCustomerAddressSnapshot,
  OrderItemSnapshot,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@database/entities/Order.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/** Payload for inserting a new checkout order (no TypeORM QueryBuilder). */
export type InsertCheckoutOrderInput = {
  userId: string;
  orderCode: string;
  status: OrderStatus;
  readyAround: string | null;
  branchId: string | null;
  branchLabel: string;
  branchLabelArabic: string;
  address: string;
  addressArabic: string;
  customerAddress: OrderCustomerAddressSnapshot | null;
  items: OrderItemSnapshot[];
  subtotal: number;
  vat: number;
  total: number;
  contact: OrderContactSnapshot;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
};

@Injectable()
export class OrderDbService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
  ) {}

  async findById(id: string): Promise<Order | null> {
    return this.orders.findOne({ where: { id } });
  }

  async findByPaymentIntentId(
    paymentIntentId: string,
  ): Promise<Order | null> {
    return this.orders.findOne({
      where: { stripe_payment_intent_id: paymentIntentId },
    });
  }

  /** User "my orders" — hide abandoned card checkouts. */
  async listByUserExcludingDraftNewestFirst(userId: string): Promise<Order[]> {
    return this.orders
      .createQueryBuilder('o')
      .where('o.user_id = :userId', { userId })
      .andWhere('o.status != :draft', { draft: 'draft' })
      .orderBy('o.created_at', 'DESC')
      .getMany();
  }

  /** Admin board — includes drafts so incomplete checkouts are visible. */
  async listAllNewestFirst(): Promise<Order[]> {
    return this.orders.find({
      order: { created_at: 'DESC' },
    });
  }

  async insertCheckoutOrder(input: InsertCheckoutOrderInput): Promise<Order> {
    return this.orders.save({
      user_id: input.userId,
      order_code: input.orderCode,
      status: input.status,
      ready_around: input.readyAround,
      branch_id: input.branchId,
      branch_label: input.branchLabel,
      branch_label_arabic: input.branchLabelArabic,
      address: input.address,
      address_arabic: input.addressArabic,
      customer_address: input.customerAddress,
      items: input.items,
      subtotal: input.subtotal,
      vat: input.vat,
      total: input.total,
      contact: input.contact,
      payment_method: input.paymentMethod,
      payment_status: input.paymentStatus,
      stripe_payment_intent_id: null,
      paid_at: null,
    });
  }

  async setKitchenStatus(
    id: string,
    status: OrderStatus,
  ): Promise<Order | null> {
    const row = await this.findById(id);
    if (!row) return null;
    row.status = status;
    return this.orders.save(row);
  }

  /**
   * After creating a PaymentIntent: store id; if prior attempt failed, reopen as unpaid.
   */
  async bindStripePaymentIntent(
    orderId: string,
    paymentIntentId: string,
  ): Promise<Order | null> {
    const row = await this.findById(orderId);
    if (!row) return null;
    row.stripe_payment_intent_id = paymentIntentId;
    if (row.payment_status === 'failed') {
      row.payment_status = 'unpaid';
    }
    return this.orders.save(row);
  }

  /** Stripe success: paid + draft→pending. Idempotent if already paid. */
  async applyPaymentSucceeded(
    orderId: string,
    paymentIntentId: string,
  ): Promise<Order | null> {
    const row = await this.findById(orderId);
    if (!row) return null;
    if (row.payment_status === 'paid') return row;

    row.payment_status = 'paid';
    row.paid_at = new Date();
    row.stripe_payment_intent_id =
      row.stripe_payment_intent_id ?? paymentIntentId;
    if (row.status === 'draft') {
      row.status = 'pending';
    }
    return this.orders.save(row);
  }

  /** Stripe fail: failed + draft→pending. Never overwrites paid. */
  async applyPaymentFailed(orderId: string): Promise<Order | null> {
    const row = await this.findById(orderId);
    if (!row) return null;
    if (row.payment_status === 'paid') return row;

    row.payment_status = 'failed';
    if (row.status === 'draft') {
      row.status = 'pending';
    }
    return this.orders.save(row);
  }
}
