import { SetMetadata } from '@nestjs/common';

export const REQUIRES_PLAN_KEY = 'requiresPlan';
export const RequiresPlan = (plan: 'starter' | 'pro' | 'business') =>
  SetMetadata(REQUIRES_PLAN_KEY, plan);
