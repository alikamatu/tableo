import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '@tableo/types';

export class UpdatePaymentDto {
  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PAID })
  @IsEnum(PaymentStatus)
  paymentStatus!: PaymentStatus;

  @ApiProperty({ required: false, example: 'PAY_ref_123abc' })
  @IsOptional()
  @IsString()
  paystackRef?: string;
}
