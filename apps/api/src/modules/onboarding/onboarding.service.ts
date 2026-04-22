import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import type { OnboardingStepDto } from './dto/onboarding-step.dto';

const STEP_ORDER = ['welcome', 'restaurant_info', 'location_hours', 'payment', 'done'] as const;
type StepName = typeof STEP_ORDER[number];

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  /** Return the current onboarding state for the user */
  async getState(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { onboardStep: true, onboardComplete: true },
    });
    if (!user) throw new NotFoundException('User not found');

    // Find their draft restaurant if any
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { ownerId: userId },
      select: {
        id: true, name: true, slug: true, description: true,
        logoUrl: true, coverUrl: true, cuisine: true,
        phone: true, email: true, address: true, city: true,
        country: true, openingHours: true, currency: true,
        paystackPublicKey: true,
        onboardStep: true, onboardComplete: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      step: user.onboardStep,
      complete: user.onboardComplete,
      restaurant,
    };
  }

  /** Save progress for a step and advance the step pointer */
  async saveStep(userId: string, dto: OnboardingStepDto) {
    const targetStep = (dto.step ?? 'restaurant_info') as StepName;

    // Step-level validation
    if (targetStep === 'restaurant_info') {
      if (!dto.name) throw new BadRequestException('Restaurant name is required.');
      if (!dto.slug) throw new BadRequestException('Slug is required.');

      // Slug uniqueness check
      const existing = await this.prisma.restaurant.findFirst({
        where: { slug: dto.slug, NOT: { ownerId: userId } },
      });
      if (existing) throw new ConflictException('This slug is already taken. Try another.');
    }

    // Determine the next step
    const currentIdx = STEP_ORDER.indexOf(targetStep);
    const nextStep = STEP_ORDER[currentIdx + 1] ?? 'done';
    const isLastStep = targetStep === 'payment';

    // Upsert the restaurant
    const existingRestaurant = await this.prisma.restaurant.findFirst({
      where: { ownerId: userId },
      orderBy: { createdAt: 'asc' },
    });

    const data = this.buildRestaurantData(dto, nextStep as StepName, isLastStep);

    let restaurant;
    if (existingRestaurant) {
      restaurant = await this.prisma.restaurant.update({
        where: { id: existingRestaurant.id },
        data,
      });
    } else {
      restaurant = await this.prisma.restaurant.create({
        data: {
          ownerId: userId,
          name: dto.name ?? 'My Restaurant',
          slug: dto.slug ?? `restaurant-${Date.now()}`,
          ...data,
        },
      });
    }

    // Advance user's onboard step
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        onboardStep: nextStep as any,
        onboardComplete: isLastStep,
      },
    });

    return {
      step: nextStep,
      complete: isLastStep,
      restaurant,
    };
  }

  /** Check slug availability */
  async checkSlug(slug: string, excludeOwnerId: string) {
    const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const taken = await this.prisma.restaurant.findFirst({
      where: { slug: clean, NOT: { ownerId: excludeOwnerId } },
      select: { id: true },
    });
    return { slug: clean, available: !taken };
  }

  private buildRestaurantData(dto: OnboardingStepDto, nextStep: StepName, isLastStep: boolean) {
    const d: Record<string, unknown> = {
      onboardStep: nextStep,
      onboardComplete: isLastStep,
    };

    if (dto.name)          d['name']          = dto.name;
    if (dto.slug)          d['slug']          = dto.slug;
    if (dto.description !== undefined) d['description'] = dto.description;
    if (dto.logoUrl !== undefined)     d['logoUrl']     = dto.logoUrl;
    if (dto.coverUrl !== undefined)    d['coverUrl']    = dto.coverUrl;
    if (dto.cuisine)       d['cuisine']       = dto.cuisine;
    if (dto.phone !== undefined)       d['phone']       = dto.phone;
    if (dto.email !== undefined)       d['email']       = dto.email;
    if (dto.address !== undefined)     d['address']     = dto.address;
    if (dto.city !== undefined)        d['city']        = dto.city;
    if (dto.country !== undefined)     d['country']     = dto.country;
    if (dto.openingHours !== undefined) d['openingHours'] = dto.openingHours;
    if (dto.paystackPublicKey !== undefined)  d['paystackPublicKey']  = dto.paystackPublicKey;
    if (dto.paystackSecretKey !== undefined)  d['paystackSecretKey']  = dto.paystackSecretKey;
    if (dto.settlementType !== undefined)     d['settlementType']     = dto.settlementType;
    if (dto.settlementBank !== undefined)     d['settlementBank']     = dto.settlementBank;
    if (dto.settlementAccountNumber !== undefined) d['settlementAccountNumber'] = dto.settlementAccountNumber;

    return d;
  }
}
