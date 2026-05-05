import type { RawBodyRequest } from '@nestjs/common';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Headers,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { SubscriptionsService } from './subscriptions.service';
import type { InitSubscriptionDto } from './dto/init-subscription.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '@tableo/types';

@ApiTags('Subscriptions')
@Controller()
export class SubscriptionsController {
  constructor(private svc: SubscriptionsService) {}

  @ApiBearerAuth()
  @Post('subscriptions/init')
  init(@CurrentUser() user: JwtPayload, @Body() dto: InitSubscriptionDto) {
    return this.svc.initSubscription(user.sub, dto);
  }

  /**
   * Paystack webhook endpoint — public, verified via HMAC signature.
   */
  @Public()
  @Post('subscriptions/webhook')
  async webhook(
    @Headers('x-paystack-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const rawBody = req.rawBody?.toString() ?? '';
    if (!this.svc.verifyWebhookSignature(rawBody, signature)) {
      throw new ForbiddenException('Invalid signature');
    }

    const payload = JSON.parse(rawBody);
    await this.svc.handleWebhook(payload.event, payload.data);
    return { received: true };
  }

  @ApiBearerAuth()
  @Post('subscriptions/verify/:reference')
  verifyTransaction(@Param('reference') reference: string) {
    return this.svc.verifyTransaction(reference);
  }

  @ApiBearerAuth()
  @Get('restaurants/:restaurantId/subscription')
  getCurrentPlan(@Param('restaurantId') restaurantId: string) {
    return this.svc.getCurrentPlan(restaurantId);
  }

  @ApiBearerAuth()
  @Post('restaurants/:restaurantId/subscription/trial')
  startTrial(
    @CurrentUser() user: JwtPayload,
    @Param('restaurantId') restaurantId: string,
    @Body('plan') plan: 'pro' | 'business',
  ) {
    return this.svc.startTrial(user.sub, restaurantId, plan);
  }

  @ApiBearerAuth()
  @Post('restaurants/:restaurantId/subscription/cancel')
  cancel(@CurrentUser() user: JwtPayload, @Param('restaurantId') restaurantId: string) {
    return this.svc.cancelSubscription(restaurantId, user.sub);
  }
}
