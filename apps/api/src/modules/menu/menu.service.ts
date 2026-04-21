import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { CreateMenuItemDto } from './dto/create-menu-item.dto';
import type { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import type { UpsertOverrideDto } from './dto/upsert-override.dto';
import type { ResolvedMenu } from '@tableo/types';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // ─── Categories ─────────────────────────────────────────────────────────────

  createCategory(restaurantId: string, dto: CreateCategoryDto) {
    return this.prisma.menuCategory.create({ data: { restaurantId, ...dto } });
  }

  findCategories(restaurantId: string) {
    return this.prisma.menuCategory.findMany({
      where: { restaurantId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  updateCategory(id: string, dto: Partial<CreateCategoryDto>) {
    return this.prisma.menuCategory.update({ where: { id }, data: dto });
  }

  deleteCategory(id: string) {
    return this.prisma.menuCategory.delete({ where: { id } });
  }

  // ─── Menu items ─────────────────────────────────────────────────────────────

  createItem(restaurantId: string, dto: CreateMenuItemDto) {
    return this.prisma.menuItem.create({ data: { restaurantId, ...dto } });
  }

  findItems(restaurantId: string) {
    return this.prisma.menuItem.findMany({
      where: { restaurantId },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    });
  }

  updateItem(id: string, dto: UpdateMenuItemDto) {
    return this.prisma.menuItem.update({ where: { id }, data: dto });
  }

  deleteItem(id: string) {
    return this.prisma.menuItem.delete({ where: { id } });
  }

  // ─── Branch overrides ────────────────────────────────────────────────────────

  upsertOverride(branchId: string, menuItemId: string, dto: UpsertOverrideDto) {
    return this.prisma.branchOverride.upsert({
      where: { branchId_menuItemId: { branchId, menuItemId } },
      create: { branchId, menuItemId, ...dto },
      update: dto,
    });
  }

  deleteOverride(branchId: string, menuItemId: string) {
    return this.prisma.branchOverride.delete({
      where: { branchId_menuItemId: { branchId, menuItemId } },
    });
  }

  // ─── Public menu resolution ──────────────────────────────────────────────────

  async resolveMenuForSlug(slug: string): Promise<ResolvedMenu> {
    const branch = await this.prisma.branch.findUnique({
      where: { slug },
      include: { restaurant: { select: { id: true, name: true, logoUrl: true } } },
    });
    if (!branch || !branch.isActive) throw new NotFoundException('Menu not found');

    const categories = await this.prisma.menuCategory.findMany({
      where: { restaurantId: branch.restaurantId },
      orderBy: { sortOrder: 'asc' },
      include: {
        menuItems: {
          orderBy: { sortOrder: 'asc' },
          include: {
            branchOverrides: {
              where: { branchId: branch.id },
            },
          },
        },
      },
    });

    return {
      branch: {
        id: branch.id,
        name: branch.name,
        logoUrl: branch.restaurant.logoUrl,
      },
      categories: categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        sortOrder: cat.sortOrder,
        items: cat.menuItems
          .map((item: any) => {
            const override = item.branchOverrides[0];
            const isAvailable = override?.isAvailable ?? item.isAvailable;
            if (!isAvailable) return null;
            return {
              id: item.id,
              name: item.name,
              description: item.description,
              imageUrl: item.imageUrl,
              price: Number(override?.priceOverride ?? item.basePrice),
              isAvailable: true,
              sortOrder: item.sortOrder,
            };
          })
          .filter((i: any): i is NonNullable<typeof i> => i !== null),
      })),
    };
  }

  async resolveMenuForBranch(branchId: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) throw new NotFoundException('Branch not found');
    return this.resolveMenuForSlug(branch.slug);
  }
}
