import { IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Plan } from '@tableo/types';

export class InitSubscriptionDto {
  @ApiProperty({ example: 'uuid-of-restaurant' })
  @IsUUID()
  restaurantId!: string;

  @ApiProperty({ enum: Plan, example: Plan.PRO })
  @IsEnum(Plan)
  plan!: Plan;
}
