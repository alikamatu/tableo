import { IsIn, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Plan, type PlanType } from '@tableo/types';

export class InitSubscriptionDto {
  @ApiProperty({ example: 'uuid-of-restaurant' })
  @IsUUID()
  restaurantId!: string;

  @ApiProperty({ enum: ['starter', 'pro', 'business'], example: 'pro' })
  @IsIn(['starter', 'pro', 'business'])
  plan!: PlanType;
}
