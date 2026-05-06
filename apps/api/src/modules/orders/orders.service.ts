import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../../config/prisma.service';
import { paginate, buildPaginationMeta } from '@tableo/utils';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  // ─── Get Paystack secret for a branch ──────────────────────
  private getPaystackSecret(branch: unknown) {
    const b = branch as any;
    const secret =
      b?.restaurant?.paystackSecretKey || this.config.get<string>('PAYSTACK_SECRET_KEY', '');
    return secret || null;
  }

  // ─── Verify a Paystack reference against the API ──────────────────────────

  private async verifyPaystackReference(
    secret: string,
    reference: string,
  ): Promise<{ verified: boolean; reference: string }> {
    if (!secret) return { verified: false, reference };

    try {
      const { data } = await axios.get<{
        status: boolean;
        data?: { status?: string; reference?: string };
      }>(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${secret}` },
        timeout: 10_000,
      });

      const verified = data.status === true && data.data?.status === 'success';
      return { verified, reference: data.data?.reference ?? reference };
    } catch {
      return { verified: false, reference };
    }
  }

  // ─── Create order ─────────────────────────────────────────────────────────

  async create(dto: CreateOrderDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Order must contain at least one item.');
    }

    return this.prisma.$transaction(async (tx: any) => {
      // Resolve item prices with branch overrides
      const resolvedItems = await Promise.all(
        dto.items.map(async (line) => {
          const menuItem = await tx.menuItem.findUnique({
            where: { id: line.menuItemId },
            include: { branchOverrides: { where: { branchId: dto.branchId } } },
          });
          if (!menuItem) {
            throw new NotFoundException(`Menu item ${line.menuItemId} not found.`);
          }

          const override = menuItem.branchOverrides[0];
          const available = override?.isAvailable ?? menuItem.isAvailable;
          if (!available) {
            throw new BadRequestException(`"${menuItem.name}" is currently unavailable.`);
          }

          const unitPrice = new Prisma.Decimal(
            (override?.priceOverride ?? menuItem.basePrice).toString(),
          );

          return {
            menuItemId: menuItem.id,
            nameSnapshot: menuItem.name,
            unitPrice,
            quantity: line.quantity,
            note: line.note ?? null,
          };
        }),
      );

      const total = resolvedItems.reduce(
        (sum: any, i: any) => sum.add(i.unitPrice.mul(new Prisma.Decimal(i.quantity))),
        new Prisma.Decimal(0),
      );

      const orderNumber = Math.random().toString(36).substring(2, 8).toUpperCase();

      const order = await tx.order.create({
        data: {
          orderNumber,
          branchId: dto.branchId,
          type: dto.type ?? 'dine_in',
          tableNumber: dto.tableNumber ?? null,
          customerName: dto.customerName ?? null,
          paymentMethod: dto.paymentMethod,
          paystackRef: dto.paystackRef ?? null,
          total,
          orderItems: { create: resolvedItems },
        },
        include: {
          orderItems: true,
          branch: { include: { restaurant: { select: { paystackSecretKey: true } } } },
        },
      });

      // Synchronous verification if reference is provided
      if (dto.paymentMethod === 'online' && dto.paystackRef) {
        const secret = this.getPaystackSecret(order.branch);
        if (secret) {
          const { verified, reference } = await this.verifyPaystackReference(
            secret,
            dto.paystackRef,
          );
          if (verified) {
            const updated = await tx.order.update({
              where: { id: order.id },
              data: { paymentStatus: 'paid', paystackRef: reference },
              include: { orderItems: true },
            });
            return this.transformOrder(updated);
          }
        }
      }

      return this.transformOrder(order);
    });
  }

  // ─── Verify payment for an existing order ────────────────────────────────
  // Called by the frontend immediately after Paystack's onSuccess callback.

  async verifyAndMarkPaid(orderId: string, reference?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        branch: {
          include: {
            restaurant: { select: { paystackSecretKey: true } },
          },
        },
        orderItems: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found.');

    // Use the reference passed in, or the one stored on the order
    const ref = reference ?? order.paystackRef;
    if (!ref) {
      throw new BadRequestException(
        'No Paystack reference. Provide the reference from the payment callback.',
      );
    }

    const secret = this.getPaystackSecret(order.branch);

    if (!secret) {
      throw new BadRequestException('Paystack secret key is not configured on this restaurant.');
    }

    const { verified, reference: confirmedRef } = await this.verifyPaystackReference(secret, ref);

    if (!verified) {
      throw new BadRequestException(
        'Paystack verification failed. Payment may not have completed yet.',
      );
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'paid',
        paystackRef: confirmedRef,
      },
      include: { orderItems: true },
    });

    return this.transformOrder(updated);
  }

  // ─── Paystack webhook ─────────────────────────────────────────────────────
  // Handles both `charge.success` (inline payment) and `subscription.create`.

  async handlePaystackWebhook(event: string, data: Record<string, unknown>) {
    if (event === 'charge.success') {
      const reference = data.reference as string | undefined;
      if (!reference) return { received: true, ignored: true };

      const order = await this.prisma.order.findFirst({
        where: { paystackRef: reference },
      });

      if (order) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'paid' },
        });
        return { received: true, updated: true };
      }
    }

    return { received: true, ignored: true };
  }

  // ─── List orders for a branch ─────────────────────────────────────────────

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
      data: orders.map((o: any) => this.transformOrder(o)),
      meta: buildPaginationMeta(total, query.page ?? 1, take),
    };
  }

  // ─── Find one order ───────────────────────────────────────────────────────

  async findOne(branchId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, branchId },
      include: { orderItems: true },
    });
    if (!order) throw new NotFoundException('Order not found.');
    return order;
  }

  // ─── Update order status ──────────────────────────────────────────────────

  async updateStatus(branchId: string, orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(branchId, orderId);
    if (order.status === 'cancelled' || order.status === 'done') {
      throw new BadRequestException(`Cannot update a ${order.status} order.`);
    }
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
      include: { orderItems: true },
    });
    return this.transformOrder(updated);
  }

  // ─── Update payment status (manual mark-as-paid) ─────────────────────────

  async updatePayment(branchId: string, orderId: string, dto: UpdatePaymentDto) {
    await this.findOne(branchId, orderId);
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: dto.paymentStatus,
        paystackRef: dto.paystackRef ?? null,
      },
      include: { orderItems: true },
    });
    return this.transformOrder(updated);
  }

  // ─── Transform: coerce Decimal → number ──────────────────────────────────

  public transformOrder(order: unknown) {
    const o = order as Record<string, any>;
    if (!o) return null;
    return {
      ...o,
      total: o['total'] ? parseFloat(o['total'].toString()) : 0,
      orderItems: (o['orderItems'] as Record<string, unknown>[] | undefined)?.map((item) => ({
        ...item,
        unitPrice: item['unitPrice'] ? parseFloat(item['unitPrice'].toString()) : 0,
      })),
    };
  }
}
