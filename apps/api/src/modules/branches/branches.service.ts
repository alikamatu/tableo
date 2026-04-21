import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../config/prisma.service';
import { generateSlug, BRANCH_LIMITS } from '@tableo/utils';
import type { CreateBranchDto } from './dto/create-branch.dto';
import type { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(restaurantId: string, ownerId: string, dto: CreateBranchDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { _count: { select: { branches: true } } },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException();

    const limit = BRANCH_LIMITS[restaurant.plan] ?? 1;
    if (restaurant._count.branches >= limit) {
      throw new BadRequestException(
        `Your ${restaurant.plan} plan allows a maximum of ${limit} branch(es). Upgrade to add more.`,
      );
    }

    const slug = generateSlug(dto.name);
    return this.prisma.branch.create({
      data: { restaurantId, slug, ...dto },
    });
  }

  findAllByRestaurant(restaurantId: string) {
    return this.prisma.branch.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async findBySlug(slug: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { slug },
      include: { restaurant: { select: { name: true, logoUrl: true } } },
    });
    if (!branch || !branch.isActive) throw new NotFoundException('Branch not found');
    return branch;
  }

  async update(id: string, ownerId: string, dto: UpdateBranchDto) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: { restaurant: { select: { ownerId: true } } },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    if (branch.restaurant.ownerId !== ownerId) throw new ForbiddenException();
    return this.prisma.branch.update({ where: { id }, data: dto });
  }

  async remove(id: string, ownerId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: { restaurant: { select: { ownerId: true } } },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    if (branch.restaurant.ownerId !== ownerId) throw new ForbiddenException();
    return this.prisma.branch.delete({ where: { id } });
  }

  async generateQrCode(slug: string, baseUrl: string): Promise<string> {
    const url = `${baseUrl}/menu/${slug}`;
    return QRCode.toDataURL(url, { width: 400, margin: 2 });
  }
}
