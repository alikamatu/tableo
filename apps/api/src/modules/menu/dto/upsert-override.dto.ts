import { IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertOverrideDto {
  @ApiProperty({ example: 40.00, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceOverride?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
