import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import type { InitSubscriptionDto } from './dto/init-subscription.dto';

// Paystack plan codes — map Tableo plan names to Paystack plan codes
const PAYSTACK_PLAN_CODES: Record<string, string> = {
  starter: '', // Free tier — no Paystack plan
  pro: 'PLN_pro_placeholder', // TODO: replace with real Paystack plan code
  business: 'PLN_business_placeholder', // TODO: replace with real Paystack plan code
};

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  private readonly paystackSecret: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.paystackSecret = this.config.get<string>('PAYSTACK_SECRET_KEY', '');
  }

  /**
   * Initialize a Paystack subscription checkout for a restaurant.
   */
  async initSubscription(ownerId: string, dto: InitSubscriptionDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: dto.restaurantId },
      include: { owner: { select: { email: true } } },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException();

    if (dto.plan === 'starter') {
      throw new BadRequestException('Starter plan is free — no subscription needed');
    }

    const planCode = PAYSTACK_PLAN_CODES[dto.plan];
    if (!planCode) throw new BadRequestException('Invalid plan');

    // Initialize Paystack transaction
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: restaurant.owner.email,
        plan: planCode,
        metadata: {
          restaurantId: restaurant.id,
          plan: dto.plan,
        },
        callback_url: this.config.get<string>(
          'CORS_ORIGINS',
          'http://localhost:3000',
        ) + '/settings?tab=billing',
      }),
    });

    const result = (await response.json()) as any;

    if (!result.status) {
      this.logger.error('Paystack init failed', result);
      throw new BadRequestException('Failed to initialize payment');
    }

    return {
      authorizationUrl: result.data.authorization_url,
      accessCode: result.data.access_code,
      reference: result.data.reference,
    };
  }

  /**
   * Handle Paystack webhook events.
   */
  async handleWebhook(event: string, data: Record<string, unknown>) {
    this.logger.log(`Paystack webhook: ${event}`);

    switch (event) {
      case 'subscription.create':
      case 'charge.success': {
        const metadata = (data.metadata ?? {}) as Record<string, string>;
        const restaurantId = metadata['restaurantId'];
        const plan = metadata['plan'];
        if (!restaurantId || !plan) {
          this.logger.warn('Webhook missing restaurantId or plan in metadata');
          return;
        }

        const subCode = (data.subscription_code as string) ?? null;
        const customerCode = (data.customer as { customer_code?: string })?.customer_code ?? null;

        await this.prisma.restaurant.update({
          where: { id: restaurantId },
          data: {
            plan: plan as 'starter' | 'pro' | 'business',
            subStatus: 'active',
            paystackSubId: subCode,
            paystackCustomerId: customerCode,
            subExpiresAt: null, // Active subscription — no expiry
          },
        });
        this.logger.log(`Restaurant ${restaurantId} upgraded to ${plan}`);
        break;
      }

      case 'subscription.disable':
      case 'subscription.not_renew': {
        const subCode = data.subscription_code as string;
        if (!subCode) return;

        const restaurant = await this.prisma.restaurant.findFirst({
          where: { paystackSubId: subCode },
        });
        if (!restaurant) return;

        await this.prisma.restaurant.update({
          where: { id: restaurant.id },
          data: {
            subStatus: 'cancelled',
            subExpiresAt: new Date(), // Mark as expired now
          },
        });
        this.logger.log(`Subscription cancelled for restaurant ${restaurant.id}`);
        break;
      }

      default:
        this.logger.log(`Unhandled webhook event: ${event}`);
    }
  }

  /**
   * Get current subscription info for a restaurant.
   */
  async getCurrentPlan(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        plan: true,
        subStatus: true,
        subExpiresAt: true,
        paystackCustomerId: true,
      },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    return restaurant;
  }

  /**
   * Cancel a Paystack subscription.
   */
  async cancelSubscription(restaurantId: string, ownerId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException();

    if (!restaurant.paystackSubId) {
      throw new BadRequestException('No active subscription to cancel');
    }

    // Disable subscription on Paystack
    const response = await fetch('https://api.paystack.co/subscription/disable', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: restaurant.paystackSubId,
        token: restaurant.paystackCustomerId,
      }),
    });

    const result = (await response.json()) as any;
    if (!result.status) {
      this.logger.error('Paystack cancel failed', result);
      throw new BadRequestException('Failed to cancel subscription');
    }

    // Update local state
    await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        subStatus: 'cancelled',
        plan: 'starter',
      },
    });

    return { message: 'Subscription cancelled. Reverted to Starter plan.' };
  }

  /**
   * Start a 30-day native free trial for a specific plan.
   */
  async startTrial(ownerId: string, restaurantId: string, plan: 'pro' | 'business') {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException();

    if (!['pro', 'business'].includes(plan)) {
      throw new BadRequestException('Trial is only available for Pro and Business plans');
    }

    // Give 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        plan,
        subStatus: 'active',
        subExpiresAt: expiresAt,
      },
    });

    return { 
      message: `30-day trial for ${plan} plan started successfully`,
      plan,
      expiresAt 
    };
  }

  /**
   * Verify Paystack webhook signature (HMAC SHA-512).
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    const crypto = require('crypto');
    const webhookSecret = this.config.get<string>('PAYSTACK_WEBHOOK_SECRET', '');
    const hash = crypto
      .createHmac('sha512', webhookSecret)
      .update(body)
      .digest('hex');
    return hash === signature;
  }
}
