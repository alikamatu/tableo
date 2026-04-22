import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone?: string;
}
