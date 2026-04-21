import { IsString, IsOptional, MaxLength, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ example: 'Osu Branch' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'Oxford Street, Osu, Accra', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '+233200000001', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false, example: { mon: '8am-10pm', tue: '8am-10pm' } })
  @IsOptional()
  @IsObject()
  openingHours?: Record<string, string>;
}
