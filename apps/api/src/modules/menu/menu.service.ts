import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { PrismaService } from '../../config/prisma.service';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';
import type { CreateMenuItemDto } from './dto/create-menu-item.dto';
import type { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import type { UpsertOverrideDto } from './dto/upsert-override.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // ─── Categories ─────────────────────────────────────────────────────────────

  createCategory(restaurantId: string, dto: CreateCategoryDto) {
    return this.prisma.menuCategory.create({
      data: { restaurantId, ...dto },
      include: {
        subCategories: true,
        _count: { select: { menuItems: true, subCategories: true } },
      },
    });
  }

  /** Returns all top-level categories with nested sub-categories and item counts */
  async findCategories(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    return this.prisma.menuCategory.findMany({
      where: { restaurantId, parentId: null },
      include: {
        _count: { select: { menuItems: true, subCategories: true } },
        subCategories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: { select: { menuItems: true } },
            menuItems: {
              select: {
                id: true,
                name: true,
                basePrice: true,
                discountedPrice: true,
                imageUrl: true,
                isAvailable: true,
                isFeatured: true,
                label: true,
                sortOrder: true,
              },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        menuItems: {
          select: {
            id: true,
            name: true,
            basePrice: true,
            discountedPrice: true,
            imageUrl: true,
            isAvailable: true,
            isFeatured: true,
            label: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findCategory(id: string) {
    return this.prisma.menuCategory.findUnique({
      where: { id },
      include: {
        subCategories: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { menuItems: true, subCategories: true } },
      },
    });
  }

  updateCategory(id: string, dto: UpdateCategoryDto) {
    return this.prisma.menuCategory.update({
      where: { id },
      data: dto,
      include: {
        subCategories: true,
        _count: { select: { menuItems: true, subCategories: true } },
      },
    });
  }

  async deleteCategory(id: string) {
    await this.prisma.menuCategory.delete({ where: { id } });
    return { id };
  }

  // ─── Menu items ─────────────────────────────────────────────────────────────

  async createItem(restaurantId: string, dto: CreateMenuItemDto) {
    const data = {
      restaurantId,
      ...dto,
      priceVariants: dto.priceVariants as Prisma.JsonValue | undefined,
    } as Prisma.MenuItemUncheckedCreateInput;

    const created = await this.prisma.menuItem.create({
      data,
      include: { category: { select: { id: true, name: true } } },
    });
    return this.transformItem(created);
  }

  async findItems(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    const items = await this.prisma.menuItem.findMany({
      where: { restaurantId },
      include: { category: { select: { id: true, name: true } } },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    });
    return items.map((i: any) => this.transformItem(i));
  }

  private transformItem(item: any) {
    if (!item) return null;
    return {
      ...item,
      basePrice: item.basePrice ? parseFloat(item.basePrice.toString()) : 0,
      discountedPrice: item.discountedPrice ? parseFloat(item.discountedPrice.toString()) : null,
    };
  }

  async findFeaturedItems(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    const items = await this.prisma.menuItem.findMany({
      where: { restaurantId, isFeatured: true, isAvailable: true },
      orderBy: { sortOrder: 'asc' },
    });
    return items.map((i: any) => this.transformItem(i));
  }

  async updateItem(id: string, dto: UpdateMenuItemDto) {
    const data = {
      ...dto,
      priceVariants: dto.priceVariants as Prisma.JsonValue | undefined,
    } as Prisma.MenuItemUncheckedUpdateInput;

    const updated = await this.prisma.menuItem.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true } } },
    });
    return this.transformItem(updated);
  }

  async deleteItem(id: string) {
    await this.prisma.menuItem.delete({ where: { id } });
    return { id };
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

  async resolveMenuForSlug(slug: string) {
    let branch = await this.prisma.branch.findUnique({
      where: { slug },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            paystackPublicKey: true,
            paystackSubaccountCode: true,
            currency: true,
            address: true,
            branches: {
              where: { isActive: true },
              select: { name: true, slug: true },
            },
          },
        },
      },
    });

    // Fallback: allow restaurant slug too, use first active branch.
    if (!branch) {
      const restaurant = await this.prisma.restaurant.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (restaurant) {
        branch = await this.prisma.branch.findFirst({
          where: { restaurantId: restaurant.id, isActive: true },
          orderBy: { createdAt: 'asc' },
          include: {
            restaurant: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                paystackPublicKey: true,
                paystackSubaccountCode: true,
                currency: true,
                address: true,
                branches: {
                  where: { isActive: true },
                  select: { name: true, slug: true },
                },
              },
            },
          },
        });
      }
    }

    if (!branch || !branch.isActive) throw new NotFoundException('Menu not found');

    // Top-level categories with sub-categories, each with their items
    const categories = await this.prisma.menuCategory.findMany({
      where: { restaurantId: branch.restaurantId, parentId: null, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            menuItems: {
              orderBy: { sortOrder: 'asc' },
              include: { branchOverrides: { where: { branchId: branch.id } } },
            },
          },
        },
        menuItems: {
          orderBy: { sortOrder: 'asc' },
          include: { branchOverrides: { where: { branchId: branch.id } } },
        },
      },
    });

    const resolveItem = (item: any) => {
      const ov = item.branchOverrides?.[0];
      const available = ov?.isAvailable ?? item.isAvailable;
      if (!available) return null;
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        galleryUrls: item.galleryUrls ?? [],
        price: parseFloat((ov?.priceOverride ?? item.basePrice).toString()),
        discountedPrice: item.discountedPrice ? parseFloat(item.discountedPrice.toString()) : null,
        priceVariants: item.priceVariants ?? [],
        label: item.label,
        tags: item.tags ?? [],
        allergens: item.allergens ?? [],
        calories: item.calories,
        prepTime: item.prepTime,
        isFeatured: item.isFeatured,
        availableFrom: item.availableFrom,
        availableTo: item.availableTo,
        isAvailable: true,
        sortOrder: item.sortOrder,
      };
    };

    return {
      branch: {
        id: branch.id,
        name: branch.name,
        slug: branch.slug,
        logoUrl: branch.restaurant.logoUrl,
        address: branch.address ?? branch.restaurant.address,
        currency: branch.restaurant.currency,
        paystackPublicKey: branch.restaurant.paystackPublicKey,
        paystackSubaccountCode: branch.restaurant.paystackSubaccountCode,
        restaurantSlug: branch.restaurant.slug,
        restaurant: {
          name: branch.restaurant.name,
          slug: branch.restaurant.slug,
          branches: await this.prisma.branch.findMany({
            where: { restaurantId: branch.restaurant.id, isActive: true },
            select: { name: true, slug: true },
            orderBy: { name: 'asc' },
          }),
        },
      },
      recommendations: categories
        .flatMap((cat: any) => [
          ...cat.menuItems,
          ...cat.subCategories.flatMap((sub: any) => sub.menuItems),
        ])
        .map(resolveItem)
        .filter(Boolean)
        .filter(
          (item: any) =>
            item.isFeatured || item.label === 'bestseller' || item.label === 'chef_special',
        )
        .slice(0, 8),
      categories: categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        coverUrl: cat.coverUrl,
        sortOrder: cat.sortOrder,
        subCategories: cat.subCategories.map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          description: sub.description,
          coverUrl: sub.coverUrl,
          sortOrder: sub.sortOrder,
          items: sub.menuItems.map(resolveItem).filter(Boolean),
        })),
        items: cat.menuItems.map(resolveItem).filter(Boolean),
      })),
    };
  }

  async resolveMenuForBranch(branchId: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) throw new NotFoundException('Branch not found');
    return this.resolveMenuForSlug(branch.slug);
  }
}
