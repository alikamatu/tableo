import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import type { JwtPayload } from '@tableo/types';

@Injectable()
export class BranchAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{
      user: JwtPayload;
      params: Record<string, string>;
    }>();
    const { user, params } = req;
    const branchId = params['branchId'];
    if (!branchId) return true;

    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      include: { restaurant: { select: { ownerId: true } } },
    });

    if (!branch) throw new ForbiddenException('Branch not found');

    // Owner always passes
    if (branch.restaurant.ownerId === user.sub) return true;

    // Active staff member passes
    const staff = await this.prisma.staffMember.findUnique({
      where: { branchId_userId: { branchId, userId: user.sub } },
      select: { isActive: true },
    });

    if (!staff?.isActive) throw new ForbiddenException('Access denied to this branch');
    return true;
  }
}
