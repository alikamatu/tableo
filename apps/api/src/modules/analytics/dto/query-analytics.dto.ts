import { IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryAnalyticsDto {
  @ApiProperty({ required: false, example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiProperty({ required: false, example: '2025-01-31' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
