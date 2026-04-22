import { IsString, IsOptional, IsUrl, MaxLength, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SettlementType } from '@prisma/client';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Chow House' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'chow-house' })
  @IsString()
  slug!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cuisine?: string[];

  @IsOptional()
  openingHours?: any; // any to avoid strict JSON type issues for now

  @IsOptional()
  @IsString()
  paystackPublicKey?: string;

  @IsOptional()
  @IsString()
  paystackSecretKey?: string;

  @IsOptional()
  @IsEnum(SettlementType)
  settlementType?: SettlementType;

  @IsOptional()
  @IsString()
  settlementBank?: string;

  @IsOptional()
  @IsString()
  settlementAccountNumber?: string;
}
