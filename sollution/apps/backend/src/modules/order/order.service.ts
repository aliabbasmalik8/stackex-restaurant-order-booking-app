import {
  Order,
  OrderItemSnapshot,
} from '@database/entities/Order.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto, OrderResponseDto } from './order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async findForUser(userId: string): Promise<OrderResponseDto[]> {
    const rows = await this.orderRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
    return rows.map((row) => this.map(row));
  }

  async create(userId: string, dto: CreateOrderDto): Promise<OrderResponseDto> {
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

    const saved = await this.orderRepo.save({
      user_id: userId,
      order_code: dto.orderCode,
      status: dto.status ?? 'pending',
      ready_around: dto.readyAround ?? null,
      branch_id: dto.branchId ?? null,
      branch_label: dto.branchLabel,
      branch_label_arabic: dto.branchLabel_arabic,
      address: dto.address,
      address_arabic: dto.address_arabic,
      customer_address: dto.customerAddress ?? null,
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
    });

    return this.map(saved);
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
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }
}
