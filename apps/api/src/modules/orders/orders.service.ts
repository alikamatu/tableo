import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { paginate, buildPaginationMeta } from '@tableo/utils';
import type { CreateOrderDto } from './dto/create-order.dto';
import type { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import type { UpdatePaymentDto } from './dto/update-payment.dto';
import type { QueryOrdersDto } from './dto/query-orders.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create an order from the public-facing menu.
   * Resolves prices from MenuItem + BranchOverride, calculates total,
   * and wraps everything in a transaction.
   */
  async create(dto: CreateOrderDto) {
    if (!dto.items.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    return this.prisma.$transaction(async (tx) => {
      // Resolve item prices
      const resolvedItems = await Promise.all(
        dto.items.map(async (item) => {
          const menuItem = await tx.menuItem.findUnique({
            where: { id: item.menuItemId },
            include: {
              branchOverrides: { where: { branchId: dto.branchId } },
            },
          });

          if (!menuItem) {
            throw new NotFoundException(
              `Menu item ${item.menuItemId} not found`,
            );
          }

          const override = menuItem.branchOverrides[0];
          const isAvailable = override?.isAvailable ?? menuItem.isAvailable;
          if (!isAvailable) {
            throw new BadRequestException(
              `"${menuItem.name}" is currently unavailable`,
            );
          }

          const unitPrice = Number(override?.priceOverride ?? menuItem.basePrice);

          return {
            menuItemId: menuItem.id,
            nameSnapshot: menuItem.name,
            unitPrice: new Prisma.Decimal(unitPrice),
            quantity: item.quantity,
            note: item.note ?? null,
          };
        }),
      );

      // Calculate total
      const total = resolvedItems.reduce(
        (sum, i) => sum + Number(i.unitPrice) * i.quantity,
        0,
      );

      // Create order with items
      return tx.order.create({
        data: {
          branchId: dto.branchId,
          tableNumber: dto.tableNumber ?? null,
          customerName: dto.customerName ?? null,
          paymentMethod: dto.paymentMethod,
          total: new Prisma.Decimal(total),
          orderItems: {
            create: resolvedItems,
          },
        },
        include: { orderItems: true },
      });
    });
  }

  /**
   * List orders for a branch with pagination and optional filters.
   */
  async findByBranch(branchId: string, query: QueryOrdersDto) {
    const { take, skip } = paginate(query.page ?? 1, query.limit ?? 20);

    const where: Prisma.OrderWhereInput = { branchId };
    if (query.status) where.status = query.status;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(`${query.to}T23:59:59.999Z`);
    }

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: { orderItems: true },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: buildPaginationMeta(total, query.page ?? 1, take),
    };
  }

  /**
   * Get a single order with its items.
   */
  async findOne(branchId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, branchId },
      include: { orderItems: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  /**
   * Update order status (pending → confirmed → ready → done | cancelled).
   */
  async updateStatus(branchId: string, orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(branchId, orderId);
    if (order.status === 'cancelled' || order.status === 'done') {
      throw new BadRequestException(`Cannot update a ${order.status} order`);
    }
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
      include: { orderItems: true },
    });
  }

  /**
   * Update order payment status.
   */
  async updatePayment(branchId: string, orderId: string, dto: UpdatePaymentDto) {
    await this.findOne(branchId, orderId);
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: dto.paymentStatus,
        paystackRef: dto.paystackRef ?? null,
      },
      include: { orderItems: true },
    });
  }
}
