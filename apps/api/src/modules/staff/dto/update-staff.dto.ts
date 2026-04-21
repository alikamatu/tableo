import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StaffRole } from '@tableo/types';

export class UpdateStaffDto {
  @ApiProperty({ enum: StaffRole, required: false })
  @IsOptional()
  @IsEnum(StaffRole)
  role?: StaffRole;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
