import {
  Order,
  OrderItemSnapshot,
  PaymentMethod,
  PaymentStatus,
} from '@database/entities/Order.model';
import { BranchDbService } from '@database/services/branch-db.service';
import { OrderDbService } from '@database/services/order-db.service';
import { ProductDbService } from '@database/services/product-db.service';
import { SettingDbService } from '@database/services/setting-db.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { OrderBookingException } from '@utils/order-booking.exception';
import {
  APP_EVENTS,
  EventsService,
  toOrderPlacedPayload,
  toOrderStatusChangedPayload,
} from '../events';
import {
  DEFAULT_STORE_STATUS,
  normalizeStoreStatus,
  parseSettingValue,
  type StoreStatusSetting,
} from '../setting/settings.catalog';
import { CreateOrderDto, OrderResponseDto } from './order.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderDb: OrderDbService,
    private readonly settingDb: SettingDbService,
    private readonly productDb: ProductDbService,
    private readonly branchDb: BranchDbService,
    private readonly events: EventsService,
  ) {}

  /** User list — excludes abandoned card drafts. */
  async findForUser(userId: string): Promise<OrderResponseDto[]> {
    const rows = await this.orderDb.listByUserExcludingDraftNewestFirst(userId);
    return rows.map((row) => this.map(row));
  }

  /** Admin list — includes drafts (incomplete checkouts). */
  async findAll(): Promise<OrderResponseDto[]> {
    const rows = await this.orderDb.listAllNewestFirst();
    return rows.map((row) => this.map(row));
  }

  async updateStatus(
    id: string,
    status: Order['status'],
  ): Promise<OrderResponseDto> {
    const saved = await this.orderDb.setKitchenStatus(id, status);
    if (!saved) {
      throw new OrderBookingException({
        error_detail: `Order ${id} not found for status update to ${status}`,
        user_error_detail: {
          english: 'Order not found.',
          arabic: 'الطلب غير موجود.',
        },
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    this.events.emit(
      APP_EVENTS.order.statusChanged,
      toOrderStatusChangedPayload(saved),
    );
    return this.map(saved);
  }

  async create(userId: string, dto: CreateOrderDto): Promise<OrderResponseDto> {
    await this.assertStoreAvailable();
    await this.assertCheckoutCatalog(dto);

    const items: OrderItemSnapshot[] = dto.items.map((item) => ({
      id: item.id,
      menuItemId: item.menuItemId,
      name: item.name,
      name_arabic: item.name_arabic,
      image: item.image,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      optionsSummary: item.optionsSummary,
      optionsSummary_arabic: item.optionsSummary_arabic,
      selectedOptionIds: item.selectedOptionIds,
      ...(item.specialInstructions?.trim()
        ? { specialInstructions: item.specialInstructions.trim() }
        : {}),
    }));

    const paymentMethod: PaymentMethod = dto.paymentMethod ?? 'cash';
    const isCard = paymentMethod === 'card';
    const paymentStatus: PaymentStatus = isCard ? 'unpaid' : 'not_required';
    const status = isCard ? 'draft' : 'pending';

    const saved = await this.orderDb.insertCheckoutOrder({
      userId,
      status,
      readyAround: dto.readyAround ?? null,
      branchId: dto.branchId ?? null,
      branchLabel: dto.branchLabel,
      branchLabelArabic: dto.branchLabel_arabic,
      address: dto.address,
      addressArabic: dto.address_arabic,
      customerAddress: dto.customerAddress ?? null,
      items,
      subtotal: dto.subtotal,
      vat: dto.vat,
      total: dto.total,
      contact: {
        name: dto.contact.name,
        phone: dto.contact.phone,
        ...(dto.contact.name_arabic
          ? { name_arabic: dto.contact.name_arabic }
          : {}),
      },
      paymentMethod,
      paymentStatus,
    });

    if (saved.status !== 'draft') {
      this.events.emit(APP_EVENTS.order.placed, toOrderPlacedPayload(saved));
    }

    return this.map(saved);
  }

  private async assertStoreAvailable(): Promise<void> {
    const row = await this.settingDb.findOverrideByKey('store_status');
    const parsed = parseSettingValue(row?.value, 'json');
    const status: StoreStatusSetting =
      normalizeStoreStatus(parsed) ?? DEFAULT_STORE_STATUS;

    if (status.isAvailable) {
      return;
    }

    throw new OrderBookingException({
      error_detail: 'Checkout blocked: store_status.isAvailable=false',
      user_error_detail: {
        english:
          status.closedMessage?.trim() ||
          'We are currently closed. Please try again later.',
        arabic:
          status.closedMessageArabic?.trim() ||
          'نحن مغلقون حالياً. يرجى المحاولة لاحقاً.',
      },
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
    });
  }

  /**
   * Reject checkout when branch is inactive or any line item is 86'd / missing
   * (or belongs to a different branch than the order).
   */
  private async assertCheckoutCatalog(dto: CreateOrderDto): Promise<void> {
    if (dto.branchId) {
      const branch = await this.branchDb.findById(dto.branchId);
      if (!branch || !branch.active) {
        throw new OrderBookingException({
          error_detail: `Checkout blocked: branch ${dto.branchId} unavailable (active=${branch?.active ?? 'missing'})`,
          user_error_detail: {
            english: 'This pickup location is not available.',
            arabic: 'موقع الاستلام هذا غير متاح.',
          },
          error_code: 'BRANCH_UNAVAILABLE',
        });
      }
    }

    const menuItemIds = [
      ...new Set(dto.items.map((item) => item.menuItemId).filter(Boolean)),
    ];
    if (menuItemIds.length === 0) {
      throw new OrderBookingException({
        error_detail: 'Checkout blocked: no menuItemIds on order items',
        user_error_detail: {
          english: 'One or more items are no longer available.',
          arabic: 'واحد أو أكثر من العناصر لم يعد متاحاً.',
        },
        error_code: 'ITEM_UNAVAILABLE',
        error_data: { unavailableMenuItemIds: [] as string[] },
      });
    }

    const products = await this.productDb.findByIds(menuItemIds);
    const byId = new Map(products.map((row) => [row.id, row]));
    const unavailableMenuItemIds: string[] = [];

    for (const id of menuItemIds) {
      const product = byId.get(id);
      if (!product || !product.available) {
        unavailableMenuItemIds.push(id);
        continue;
      }
      if (dto.branchId && product.branch_id !== dto.branchId) {
        unavailableMenuItemIds.push(id);
      }
    }

    if (unavailableMenuItemIds.length > 0) {
      throw new OrderBookingException({
        error_detail: `Checkout blocked: unavailable menu items [${unavailableMenuItemIds.join(', ')}]`,
        user_error_detail: {
          english: 'One or more items are no longer available.',
          arabic: 'واحد أو أكثر من العناصر لم يعد متاحاً.',
        },
        error_code: 'ITEM_UNAVAILABLE',
        error_data: { unavailableMenuItemIds },
      });
    }
  }

  private map(row: Order): OrderResponseDto {
    return {
      id: row.id,
      userId: row.user_id,
      orderCode: row.order_code,
      status: row.status,
      readyAround: row.ready_around,
      branchId: row.branch_id,
      branchLabel: row.branch_label,
      branchLabel_arabic: row.branch_label_arabic,
      address: row.address,
      address_arabic: row.address_arabic,
      customerAddress: row.customer_address,
      items: row.items ?? [],
      subtotal: row.subtotal,
      vat: row.vat,
      total: row.total,
      contact: row.contact,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      stripePaymentIntentId: row.stripe_payment_intent_id,
      paidAt: row.paid_at ? row.paid_at.toISOString() : null,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}
