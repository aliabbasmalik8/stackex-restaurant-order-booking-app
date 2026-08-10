import {
  OrderContactSnapshot,
  OrderCustomerAddressSnapshot,
  OrderItemSnapshot,
  OrderStatus,
} from '@database/entities/Order.model';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  id!: string;

  @IsString()
  menuItemId!: string;

  @IsString()
  name!: string;

  @IsString()
  name_arabic!: string;

  @IsString()
  image!: string;

  @IsNumber()
  unitPrice!: number;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsString()
  optionsSummary!: string;

  @IsString()
  optionsSummary_arabic!: string;

  @IsArray()
  @IsString({ each: true })
  selectedOptionIds!: string[];

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class CreateOrderContactDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  name_arabic?: string;

  @IsString()
  phone!: string;
}

export class CreateOrderAddressDto {
  @IsString()
  line1!: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @IsString()
  orderCode!: string;

  @IsOptional()
  @IsString()
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  readyAround?: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsString()
  branchLabel!: string;

  @IsString()
  branchLabel_arabic!: string;

  @IsString()
  address!: string;

  @IsString()
  address_arabic!: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @ValidateNested()
  @Type(() => CreateOrderAddressDto)
  customerAddress?: CreateOrderAddressDto | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsNumber()
  subtotal!: number;

  @IsNumber()
  vat!: number;

  @IsNumber()
  total!: number;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateOrderContactDto)
  contact!: CreateOrderContactDto;
}

export class OrderResponseDto {
  id!: string;
  userId!: string;
  orderCode!: string;
  status!: OrderStatus;
  readyAround!: string | null;
  branchId!: string | null;
  branchLabel!: string;
  branchLabel_arabic!: string;
  address!: string;
  address_arabic!: string;
  customerAddress!: OrderCustomerAddressSnapshot | null;
  items!: OrderItemSnapshot[];
  subtotal!: number;
  vat!: number;
  total!: number;
  contact!: OrderContactSnapshot;
  createdAt!: string;
  updatedAt!: string;
}
