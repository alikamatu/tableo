import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ManagerService } from './manager.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '@tableo/types';

@ApiTags('Manager')
@ApiBearerAuth()
@Controller('manager')
export class ManagerController {
  constructor(private svc: ManagerService) {}

  /** GET /manager/branch/:branchId — full branch context for the manager header */
  @Get('branch/:branchId')
  getBranchContext(@CurrentUser() user: JwtPayload, @Param('branchId') branchId: string) {
    return this.svc.getBranchContext(user.sub, branchId);
  }

  /** GET /manager/branch/:branchId/summary — today's KPIs */
  @Get('branch/:branchId/summary')
  getSummary(@CurrentUser() user: JwtPayload, @Param('branchId') branchId: string) {
    return this.svc.getTodaySummary(user.sub, branchId);
  }

  /** GET /manager/branch/:branchId/orders/live — active orders only */
  @Get('branch/:branchId/orders/live')
  getLiveOrders(@CurrentUser() user: JwtPayload, @Param('branchId') branchId: string) {
    return this.svc.getLiveOrders(user.sub, branchId);
  }

  /** GET /manager/branch/:branchId/orders — all recent orders */
  @Get('branch/:branchId/orders')
  getAllOrders(@CurrentUser() user: JwtPayload, @Param('branchId') branchId: string) {
    return this.svc.getAllOrders(user.sub, branchId);
  }

  /** PATCH /manager/branch/:branchId/orders/:orderId — update order status */
  @Patch('branch/:branchId/orders/:orderId')
  updateOrder(
    @CurrentUser() user: JwtPayload,
    @Param('branchId') branchId: string,
    @Param('orderId') orderId: string,
    @Body() body: { status: 'confirmed' | 'ready' | 'done' | 'cancelled' },
  ) {
    return this.svc.updateOrderStatus(user.sub, branchId, orderId, body.status);
  }

  /** GET /manager/branch/:branchId/menu — menu with overrides */
  @Get('branch/:branchId/menu')
  getMenu(@CurrentUser() user: JwtPayload, @Param('branchId') branchId: string) {
    return this.svc.getMenu(user.sub, branchId);
  }

  /** POST /manager/branch/:branchId/menu/:itemId/toggle — toggle item availability */
  @Post('branch/:branchId/menu/:itemId/toggle')
  toggleItem(
    @CurrentUser() user: JwtPayload,
    @Param('branchId') branchId: string,
    @Param('itemId') itemId: string,
    @Body() body: { isAvailable: boolean },
  ) {
    return this.svc.toggleItemAvailability(user.sub, branchId, itemId, body.isAvailable);
  }

  /** GET /manager/branch/:branchId/staff — staff list (manager only) */
  @Get('branch/:branchId/staff')
  getStaff(@CurrentUser() user: JwtPayload, @Param('branchId') branchId: string) {
    return this.svc.getStaff(user.sub, branchId);
  }
}
