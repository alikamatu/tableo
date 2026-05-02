import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUrl,
  IsUUID,
  IsArray,
  IsEnum,
  IsInt,
  Min,
  MaxLength,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ItemLabel {
  NONE = 'none',
  NEW_ITEM = 'new_item',
  BESTSELLER = 'bestseller',
  SPICY = 'spicy',
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  GLUTEN_FREE = 'gluten_free',
  CHEF_SPECIAL = 'chef_special',
  LIMITED = 'limited',
}

export class PriceVariantDto {
  @IsString() @MaxLength(60) label!: string;
  @IsNumber() @Min(0) price!: number;
}

export class CreateMenuItemDto {
  @ApiProperty({ example: 'uuid-of-category' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ example: 'Jollof Rice & Chicken' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: 'Smoky party jollof with perfectly grilled chicken' })
  @IsOptional()
  @IsString()
  @MaxLength(600)
  description?: string;

  @ApiProperty({ example: 80.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @ApiPropertyOptional({ description: 'Strike-through price for showing a discount' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountedPrice?: number;

  @ApiPropertyOptional({ description: 'Size/variant options e.g. [{label:"Small",price:20}]' })
  @IsOptional()
  @IsArray()
  priceVariants?: PriceVariantDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({}, { message: 'imageUrl must be a valid URL.' })
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Additional gallery image URLs' })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  galleryUrls?: string[];

  @ApiPropertyOptional({ enum: ItemLabel })
  @IsOptional()
  @IsEnum(ItemLabel)
  label?: ItemLabel;

  @ApiPropertyOptional({ description: 'Free-form tags e.g. ["spicy","local"]' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Allergen flags e.g. ["nuts","dairy"]' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @ApiPropertyOptional({ example: 450, description: 'Calories (kcal)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999)
  calories?: number;

  @ApiPropertyOptional({ example: 15, description: 'Prep time in minutes' })
  @IsOptional()
  @IsInt()
  @Min(0)
  prepTime?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: '08:00', description: 'Available from this time (HH:MM)' })
  @IsOptional()
  @IsString()
  availableFrom?: string;

  @ApiPropertyOptional({ example: '22:00', description: 'Available until this time (HH:MM)' })
  @IsOptional()
  @IsString()
  availableTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}
