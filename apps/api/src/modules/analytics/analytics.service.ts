import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { yesterdayString, toDateString } from '@tableo/utils';
import { QueryAnalyticsDto } from './dto/query-analytics.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Return stored analytics snapshots for a date range.
   */
  async getSnapshots(branchId: string, query: QueryAnalyticsDto) {
    const where: Prisma.AnalyticsSnapshotWhereInput = { branchId };

    if (query.from || query.to) {
      where.date = {};
      if (query.from) where.date.gte = new Date(query.from);
      if (query.to) where.date.lte = new Date(query.to);
    }

    return this.prisma.analyticsSnapshot.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Live dashboard summary: aggregate today's orders data in real-time.
   */
  async getLiveSummary(branchId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const orders = await this.prisma.order.findMany({
      where: {
        branchId,
        createdAt: { gte: todayStart, lte: todayEnd },
        status: { not: 'cancelled' },
      },
      include: { orderItems: true },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Orders by hour
    const ordersByHour: Record<number, number> = {};
    orders.forEach((o: any) => {
      const hour = o.createdAt.getHours();
      ordersByHour[hour] = (ordersByHour[hour] ?? 0) + 1;
    });

    // Top items
    const itemCounts: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach((o: any) => {
      o.orderItems.forEach((item: any) => {
        if (!itemCounts[item.menuItemId]) {
          itemCounts[item.menuItemId] = {
            name: item.nameSnapshot,
            qty: 0,
            revenue: 0,
          };
        }
        itemCounts[item.menuItemId]!.qty += item.quantity;
        itemCounts[item.menuItemId]!.revenue += Number(item.unitPrice) * item.quantity;
      });
    });

    const topItems = Object.entries(itemCounts)
      .map(([itemId, data]) => ({ itemId, ...data }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    // Pending / active order counts by status
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      ready: 0,
      done: 0,
    };
    orders.forEach((o: any) => {
      if (o.status in statusCounts) {
        statusCounts[o.status as keyof typeof statusCounts]++;
      }
    });

    return {
      date: toDateString(new Date()),
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      ordersByHour,
      topItems,
      statusCounts,
    };
  }

  /**
   * Generate daily snapshot for a specific branch and date.
   * Called by the cron job for the previous day.
   */
  async generateDailySnapshot(branchId: string, date: Date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const orders = await this.prisma.order.findMany({
      where: {
        branchId,
        createdAt: { gte: dayStart, lte: dayEnd },
        status: { not: 'cancelled' },
      },
      include: { orderItems: true },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const ordersByHour: Record<number, number> = {};
    orders.forEach((o: any) => {
      const hour = o.createdAt.getHours();
      ordersByHour[hour] = (ordersByHour[hour] ?? 0) + 1;
    });

    const itemCounts: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach((o: any) => {
      o.orderItems.forEach((item: any) => {
        if (!itemCounts[item.menuItemId]) {
          itemCounts[item.menuItemId] = {
            name: item.nameSnapshot,
            qty: 0,
            revenue: 0,
          };
        }
        itemCounts[item.menuItemId]!.qty += item.quantity;
        itemCounts[item.menuItemId]!.revenue += Number(item.unitPrice) * item.quantity;
      });
    });

    const topItems = Object.entries(itemCounts)
      .map(([itemId, data]) => ({ itemId, ...data }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    return this.prisma.analyticsSnapshot.upsert({
      where: { branchId_date: { branchId, date: dayStart } },
      create: {
        branchId,
        date: dayStart,
        totalOrders,
        totalRevenue: new Prisma.Decimal(totalRevenue),
        avgOrderValue: new Prisma.Decimal(avgOrderValue),
        ordersByHour,
        topItems,
      },
      update: {
        totalOrders,
        totalRevenue: new Prisma.Decimal(totalRevenue),
        avgOrderValue: new Prisma.Decimal(avgOrderValue),
        ordersByHour,
        topItems,
      },
    });
  }

  /**
   * Generate snapshots for ALL active branches — called by cron.
   */
  async generateAllSnapshots() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const branches = await this.prisma.branch.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    this.logger.log(
      `Generating analytics snapshots for ${branches.length} branches (${yesterdayString()})`,
    );

    const results = await Promise.allSettled(
      branches.map((b: any) => this.generateDailySnapshot(b.id, yesterday)),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    this.logger.log(`Snapshots complete: ${succeeded} succeeded, ${failed} failed`);
  }
}
