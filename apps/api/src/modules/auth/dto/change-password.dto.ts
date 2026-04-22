import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  oldPassword?: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
