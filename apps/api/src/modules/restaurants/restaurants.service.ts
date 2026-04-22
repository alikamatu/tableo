import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import type { UpdateRestaurantDto } from './dto/update-restaurant.dto';

// Fields never returned to the client (strip from all responses)
const STRIP_FIELDS = ['paystackSecretKey'] as const;

function strip<T extends Record<string, unknown>>(obj: T): Omit<T, 'paystackSecretKey'> {
  const clone = { ...obj };
  for (const key of STRIP_FIELDS) delete (clone as Record<string, unknown>)[key];
  return clone as Omit<T, 'paystackSecretKey'>;
}

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  // ─── Find all by owner ───────────────────────────────────────────────────

  async findAllByOwner(ownerId: string) {
    const rows = await this.prisma.restaurant.findMany({
      where: { ownerId },
      include: {
        _count: { select: { branches: true, menuItems: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(strip);
  }

  // ─── Find one ────────────────────────────────────────────────────────────

  async findOne(id: string, ownerId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        branches: { select: { id: true, name: true, slug: true, isActive: true } },
        _count: { select: { menuItems: true, branches: true } },
      },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found.');
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException();
    return strip(restaurant as Record<string, unknown>) as typeof restaurant;
  }

  // ─── Update ──────────────────────────────────────────────────────────────

  async update(id: string, ownerId: string, dto: UpdateRestaurantDto) {
    // Ownership check
    await this.findOne(id, ownerId);

    // Slug uniqueness (if slug is being changed)
    if (dto.slug) {
      const conflict = await this.prisma.restaurant.findFirst({
        where: { slug: dto.slug, NOT: { id } },
        select: { id: true },
      });
      if (conflict) throw new BadRequestException('This slug is already taken. Choose another.');
    }

    const updated = await this.prisma.restaurant.update({
      where: { id },
      data: dto as Record<string, unknown>,
      include: {
        branches: { select: { id: true, name: true, slug: true, isActive: true } },
        _count: { select: { menuItems: true, branches: true } },
      },
    });

    return strip(updated as Record<string, unknown>) as typeof updated;
  }

  // ─── Remove ──────────────────────────────────────────────────────────────

  async remove(id: string, ownerId: string) {
    await this.findOne(id, ownerId);
    await this.prisma.restaurant.delete({ where: { id } });
    return { id };
  }
}
