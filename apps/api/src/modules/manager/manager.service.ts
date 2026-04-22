import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class ManagerService {
  constructor(private prisma: PrismaService) {}

  private async assertAccess(userId: string, branchId: string) {
    const staff = await this.prisma.staffMember.findUnique({
      where: { branchId_userId: { branchId, userId } },
      select: { role: true, isActive: true },
    });
    if (!staff || !staff.isActive) throw new ForbiddenException('Access denied to this branch.');
    return staff.role;
  }

  async getBranchContext(userId: string, branchId: string) {
    await this.assertAccess(userId, branchId);
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      include: {
        restaurant: { select: { id: true, name: true, logoUrl: true, currency: true, plan: true } },
        staffMembers: {
          where: { isActive: true },
          include: { user: { select: { id: true, fullName: true, email: true } } },
        },
        _count: { select: { orders: true } },
      },
    });
    if (!branch) throw new NotFoundException('Branch not found.');
    return branch;
  }

  async getLiveOrders(userId: string, branchId: string) {
    await this.assertAccess(userId, branchId);
    return this.prisma.order.findMany({
      where: { branchId, status: { in: ['pending', 'confirmed', 'ready'] } },
      include: {
        orderItems: { include: { menuItem: { select: { name: true, imageUrl: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllOrders(userId: string, branchId: string) {
    await this.assertAccess(userId, branchId);
    return this.prisma.order.findMany({
      where: { branchId },
      include: {
        orderItems: { include: { menuItem: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async updateOrderStatus(
    userId: string,
    branchId: string,
    orderId: string,
    status: 'confirmed' | 'ready' | 'done' | 'cancelled',
  ) {
    await this.assertAccess(userId, branchId);
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.branchId !== branchId) throw new NotFoundException('Order not found.');
    return this.prisma.order.update({ where: { id: orderId }, data: { status } });
  }

  async getTodaySummary(userId: string, branchId: string) {
    await this.assertAccess(userId, branchId);

    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);

    const [totalOrders, revenue, pending, confirmed, ready] = await Promise.all([
      this.prisma.order.count({ where: { branchId, createdAt: { gte: start, lte: end } } }),
      this.prisma.order.aggregate({
        where: { branchId, createdAt: { gte: start, lte: end }, paymentStatus: 'paid' },
        _sum: { total: true },
      }),
      this.prisma.order.count({ where: { branchId, status: 'pending' } }),
      this.prisma.order.count({ where: { branchId, status: 'confirmed' } }),
      this.prisma.order.count({ where: { branchId, status: 'ready' } }),
    ]);

    return {
      todayOrders:     totalOrders,
      todayRevenue:    Number(revenue._sum.total ?? 0),
      pendingOrders:   pending,
      confirmedOrders: confirmed,
      readyOrders:     ready,
    };
  }

  async getMenu(userId: string, branchId: string) {
    await this.assertAccess(userId, branchId);
    const branch = await this.prisma.branch.findUnique({ where: { id: branchId }, select: { restaurantId: true } });
    if (!branch) throw new NotFoundException('Branch not found.');

    return this.prisma.menuCategory.findMany({
      where: { restaurantId: branch.restaurantId },
      include: {
        menuItems: {
          include: { branchOverrides: { where: { branchId } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async toggleItemAvailability(userId: string, branchId: string, menuItemId: string, isAvailable: boolean) {
    await this.assertAccess(userId, branchId);
    return this.prisma.branchOverride.upsert({
      where: { branchId_menuItemId: { branchId, menuItemId } },
      create: { branchId, menuItemId, isAvailable },
      update: { isAvailable },
    });
  }

  async getStaff(userId: string, branchId: string) {
    const role = await this.assertAccess(userId, branchId);
    if (role !== 'manager') throw new ForbiddenException('Only managers can view staff.');
    return this.prisma.staffMember.findMany({
      where: { branchId },
      include: { user: { select: { id: true, fullName: true, email: true, phone: true } } },
      orderBy: { invitedAt: 'desc' },
    });
  }
}
