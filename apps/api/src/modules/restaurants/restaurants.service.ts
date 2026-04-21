import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import type { CreateRestaurantDto } from './dto/create-restaurant.dto';
import type { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  create(ownerId: string, dto: CreateRestaurantDto) {
    return this.prisma.restaurant.create({
      data: { ownerId, ...dto },
    });
  }

  findAllByOwner(ownerId: string) {
    return this.prisma.restaurant.findMany({
      where: { ownerId },
      include: { _count: { select: { branches: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, ownerId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: { branches: true, _count: { select: { menuItems: true } } },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException();
    return restaurant;
  }

  async update(id: string, ownerId: string, dto: UpdateRestaurantDto) {
    await this.findOne(id, ownerId);
    return this.prisma.restaurant.update({ where: { id }, data: dto });
  }

  async remove(id: string, ownerId: string) {
    await this.findOne(id, ownerId);
    return this.prisma.restaurant.delete({ where: { id } });
  }
}
