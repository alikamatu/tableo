import { IsString, IsOptional, IsNumber, IsBoolean, IsUrl, IsUUID, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'uuid-of-category' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ example: 'Jollof Rice' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'Smoky party jollof with grilled chicken', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 35.00 })
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}
