import { IsOptional, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@tableo/types';

export class QueryOrdersDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({ enum: OrderStatus, required: false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ required: false, example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiProperty({ required: false, example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
