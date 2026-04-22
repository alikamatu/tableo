import {
  IsString, IsOptional, IsUrl, MaxLength, IsArray,
  IsEnum, IsEmail, Matches, Length,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { SettlementType } from '@prisma/client';

function trim(v: unknown) {
  return typeof v === 'string' ? v.trim() : v;
}
function lower(v: unknown) {
  return typeof v === 'string' ? v.trim().toLowerCase() : v;
}

export class UpdateRestaurantDto {
  // ── Identity ──────────────────────────────────────────────────────────────

  @ApiPropertyOptional() @IsOptional()
  @IsString() @MaxLength(120)
  @Transform(({ value }) => trim(value))
  name?: string;

  @ApiPropertyOptional() @IsOptional()
  @IsString() @MaxLength(60)
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must only contain lowercase letters, numbers, and hyphens.' })
  @Transform(({ value }) => lower(value))
  slug?: string;

  @ApiPropertyOptional() @IsOptional()
  @IsString() @MaxLength(500)
  description?: string;

  @ApiPropertyOptional() @IsOptional()
  @IsString() @MaxLength(160)
  tagline?: string;

  @ApiPropertyOptional() @IsOptional()
  @IsUrl({}, { message: 'Logo must be a valid URL.' })
  logoUrl?: string;

  @ApiPropertyOptional() @IsOptional()
  @IsUrl({}, { message: 'Cover must be a valid URL.' })
  coverUrl?: string;

  @ApiPropertyOptional() @IsOptional()
  @IsArray() @IsString({ each: true })
  cuisine?: string[];

  // ── Contact ───────────────────────────────────────────────────────────────

  @ApiPropertyOptional() @IsOptional()
  @IsString() @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional() @IsOptional()
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @Transform(({ value }) => lower(value))
  email?: string;

  @ApiPropertyOptional() @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL (include https://).' })
  website?: string;

  // ── Social ────────────────────────────────────────────────────────────────

  @ApiPropertyOptional() @IsOptional()
  @IsString() @MaxLength(60)
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/^@/, '').trim() : value))
  instagramHandle?: string;

  @ApiPropertyOptional() @IsOptional()
  @IsString() @MaxLength(60)
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/^@/, '').trim() : value))
  twitterHandle?: string;

  @ApiPropertyOptional() @IsOptional()
  @IsString() @MaxLength(100)
  @Transform(({ value }) => trim(value))
  facebookHandle?: string;

  @ApiPropertyOptional() @IsOptional()
  @IsString() @MaxLength(60)
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/^@/, '').trim() : value))
  tiktokHandle?: string;

  // ── Location ──────────────────────────────────────────────────────────────

  @ApiPropertyOptional() @IsOptional()
  @IsString() @MaxLength(300)
  address?: string;

  @ApiPropertyOptional() @IsOptional()
  @IsString() @MaxLength(80)
  city?: string;

  @ApiPropertyOptional() @IsOptional()
  @IsString() @MaxLength(80)
  country?: string;

  @ApiPropertyOptional() @IsOptional()
  @IsString() @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional() @IsOptional()
  openingHours?: Record<string, { open: string; close: string; closed: boolean }>;

  // ── Paystack ──────────────────────────────────────────────────────────────

  @ApiPropertyOptional() @IsOptional()
  @IsString()
  @Matches(/^pk_/, { message: 'Public key must start with pk_' })
  paystackPublicKey?: string;

  @ApiPropertyOptional() @IsOptional()
  @IsString()
  @Matches(/^sk_/, { message: 'Secret key must start with sk_' })
  paystackSecretKey?: string;

  // ── Settlement ────────────────────────────────────────────────────────────

  @ApiPropertyOptional({ enum: SettlementType }) @IsOptional()
  @IsEnum(SettlementType)
  settlementType?: SettlementType;

  @ApiPropertyOptional() @IsOptional()
  @IsString() @MaxLength(120)
  settlementBank?: string;

  @ApiPropertyOptional() @IsOptional()
  @IsString() @MaxLength(20)
  settlementAccountNumber?: string;
}
