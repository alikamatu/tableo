import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus, type PaymentStatusType } from '@tableo/types';

export class UpdatePaymentDto {
  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PAID })
  @IsEnum(PaymentStatus)
  paymentStatus!: PaymentStatusType;

  @ApiProperty({ required: false, example: 'PAY_ref_123abc' })
  @IsOptional()
  @IsString()
  paystackRef?: string;
}
