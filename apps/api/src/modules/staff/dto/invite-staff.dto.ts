import { IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StaffRole } from '@tableo/types';

export class InviteStaffDto {
  @ApiProperty({ example: 'cashier@chowhouse.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: StaffRole, example: StaffRole.CASHIER })
  @IsEnum(StaffRole)
  role!: StaffRole;
}
