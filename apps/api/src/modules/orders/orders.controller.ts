import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { Public } from '../../common/decorators/public.decorator';
import { BranchAccessGuard } from '../../common/guards/branch-access.guard';

@ApiTags('Orders')
@Controller()
export class OrdersController {
  constructor(private svc: OrdersService) {}

  // ─── Public: customer places order ────────────────────────────────────────

  @Public()
  @Post('orders')
  create(@Body() dto: CreateOrderDto) {
    return this.svc.create(dto);
  }

  /**
   * Called by the menu frontend immediately after Paystack's onSuccess callback.
   * Verifies the reference with Paystack and marks the order as paid.
   * Must be public — the customer is unauthenticated.
   */
  @Public()
  @Post('orders/:orderId/verify-payment')
  verifyPayment(@Param('orderId') orderId: string, @Body() body: { reference?: string }) {
    return this.svc.verifyAndMarkPaid(orderId, body.reference);
  }

  /**
   * Paystack webhook — receives charge.success events.
   * Acts as a fallback if the frontend verify call doesn't fire.
   */
  @Public()
  @Post('payments/paystack/webhook')
  paystackWebhook(@Body() payload: Record<string, unknown>) {
    const event = (payload?.event as string) ?? '';
    const data = (payload?.data as Record<string, unknown>) ?? {};
    return this.svc.handlePaystackWebhook(event, data);
  }

  // ─── Authenticated: staff / owner manage orders ───────────────────────────

  @ApiBearerAuth()
  @Get('branches/:branchId/orders')
  @UseGuards(BranchAccessGuard)
  findAll(@Param('branchId') branchId: string, @Query() query: QueryOrdersDto) {
    return this.svc.findByBranch(branchId, query);
  }

  @ApiBearerAuth()
  @Get('branches/:branchId/orders/:orderId')
  @UseGuards(BranchAccessGuard)
  async findOne(@Param('branchId') branchId: string, @Param('orderId') orderId: string) {
    const order = await this.svc.findOne(branchId, orderId);
    return this.svc.transformOrder(order);
  }

  @ApiBearerAuth()
  @Patch('branches/:branchId/orders/:orderId/status')
  @UseGuards(BranchAccessGuard)
  updateStatus(
    @Param('branchId') branchId: string,
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.svc.updateStatus(branchId, orderId, dto);
  }

  /**
   * Manual payment status update — used by staff when:
   *   a) Customer paid at counter
   *   b) Online payment verification failed but cash was collected
   */
  @ApiBearerAuth()
  @Patch('branches/:branchId/orders/:orderId/payment')
  @UseGuards(BranchAccessGuard)
  updatePayment(
    @Param('branchId') branchId: string,
    @Param('orderId') orderId: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.svc.updatePayment(branchId, orderId, dto);
  }
}
