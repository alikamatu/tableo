import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  PaymentMethod,
  OrderType,
  type PaymentMethodType,
  type OrderTypeType,
} from '@tableo/types';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'uuid-of-menu-item' })
  @IsUUID()
  menuItemId!: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 'Extra spicy', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  note?: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'uuid-of-branch' })
  @IsUUID()
  branchId!: string;

  @ApiProperty({ example: 'T5', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  tableNumber?: string;

  @ApiProperty({ enum: OrderType, default: OrderType.DINE_IN })
  @IsEnum(OrderType)
  @IsOptional()
  type?: OrderTypeType;

  @ApiProperty({ example: 'Kofi Mensah', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  customerName?: string;

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.COUNTER })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethodType;

  @ApiProperty({ required: false, example: 'PSK_REF_123456' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  paystackRef?: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
