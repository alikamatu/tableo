import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import type { JwtPayload } from '@tableo/types';

@Injectable()
export class RestaurantAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{
      user: JwtPayload;
      params: Record<string, string>;
    }>();
    const { user, params } = req;
    const restaurantId = params['restaurantId'];

    // If no restaurantId in params, we might be on a global route, let it pass or handle accordingly
    if (!restaurantId) return true;

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { ownerId: true },
    });

    if (!restaurant) {
      throw new ForbiddenException('Restaurant not found');
    }

    // Only the owner can manage the global restaurant menu
    if (restaurant.ownerId !== user.sub) {
      throw new ForbiddenException('You do not have permission to manage this restaurant');
    }

    return true;
  }
}
