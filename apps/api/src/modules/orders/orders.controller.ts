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

  // ─── Public: customer places order ────────────────────────────────────────────

  @Public()
  @Post('orders')
  create(@Body() dto: CreateOrderDto) {
    return this.svc.create(dto);
  }

  // ─── Staff / owner: manage orders ─────────────────────────────────────────────

  @ApiBearerAuth()
  @Get('branches/:branchId/orders')
  @UseGuards(BranchAccessGuard)
  findAll(
    @Param('branchId') branchId: string,
    @Query() query: QueryOrdersDto,
  ) {
    return this.svc.findByBranch(branchId, query);
  }

  @ApiBearerAuth()
  @Get('branches/:branchId/orders/:orderId')
  @UseGuards(BranchAccessGuard)
  findOne(
    @Param('branchId') branchId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.svc.findOne(branchId, orderId);
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
