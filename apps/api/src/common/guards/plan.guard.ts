import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../config/prisma.service';
import { REQUIRES_PLAN_KEY } from '../decorators/requires-plan.decorator';
import { planSatisfies } from '@tableo/utils';
import type { JwtPayload } from '@tableo/types';

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlan = this.reflector.getAllAndOverride<string>(REQUIRES_PLAN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPlan) return true;

    const req = context.switchToHttp().getRequest<{ user: JwtPayload; params: Record<string, string> }>();
    const { user, params } = req;

    // Resolve restaurantId from route — either direct or via branch
    let restaurantId = params['restaurantId'];
    if (!restaurantId && params['branchId']) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: params['branchId'] },
        select: { restaurantId: true },
      });
      restaurantId = branch?.restaurantId ?? '';
    }

    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId || '', ownerId: user.sub },
      select: { plan: true, subStatus: true },
    });

    if (!restaurant || restaurant.subStatus !== 'active') {
      throw new ForbiddenException('Active subscription required');
    }

    if (!planSatisfies(restaurant.plan, requiredPlan)) {
      throw new ForbiddenException(`This feature requires the ${requiredPlan} plan or higher`);
    }

    return true;
  }
}
