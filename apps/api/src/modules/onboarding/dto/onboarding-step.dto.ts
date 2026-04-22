import { IsString, IsOptional, IsArray, IsObject, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OnboardingStepDto {
  @ApiProperty({ enum: ['welcome', 'restaurant_info', 'location_hours', 'payment', 'done'], required: false })
  @IsOptional()
  @IsString()
  step?: string;

  @ApiProperty({ example: 'Chow House', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'chow-house', required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  cuisine?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  openingHours?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  paystackPublicKey?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  paystackSecretKey?: string;

  @ApiProperty({ required: false, enum: ['bank', 'momo'] })
  @IsOptional()
  @IsString()
  settlementType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  settlementBank?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  settlementAccountNumber?: string;
}
