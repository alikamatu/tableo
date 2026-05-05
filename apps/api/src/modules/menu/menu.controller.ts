import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import type { CreateCategoryDto } from './dto/create-category.dto';
import type { UpdateCategoryDto } from './dto/update-category.dto';
import type { CreateMenuItemDto } from './dto/create-menu-item.dto';
import type { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import type { UpsertOverrideDto } from './dto/upsert-override.dto';
import { BranchAccessGuard } from '../../common/guards/branch-access.guard';
import { RestaurantAccessGuard } from '../../common/guards/restaurant-access.guard';

@ApiTags('Menu')
@ApiBearerAuth()
@Controller('restaurants/:restaurantId')
export class MenuController {
  constructor(private svc: MenuService) {}

  // ─── Categories ─────────────────────────────────────────────────────────────

  @Post('categories')
  @UseGuards(RestaurantAccessGuard)
  createCategory(@Param('restaurantId') rId: string, @Body() dto: CreateCategoryDto) {
    return this.svc.createCategory(rId, dto);
  }

  @Get('categories')
  findCategories(@Param('restaurantId') rId: string) {
    return this.svc.findCategories(rId);
  }

  @Get('categories/:categoryId')
  findCategory(@Param('categoryId') id: string) {
    return this.svc.findCategory(id);
  }

  @Patch('categories/:categoryId')
  @UseGuards(RestaurantAccessGuard)
  updateCategory(@Param('categoryId') id: string, @Body() dto: UpdateCategoryDto) {
    return this.svc.updateCategory(id, dto);
  }

  @Delete('categories/:categoryId')
  @UseGuards(RestaurantAccessGuard)
  deleteCategory(@Param('categoryId') id: string) {
    return this.svc.deleteCategory(id);
  }

  // ─── Items ───────────────────────────────────────────────────────────────────

  @Post('items')
  @UseGuards(RestaurantAccessGuard)
  createItem(@Param('restaurantId') rId: string, @Body() dto: CreateMenuItemDto) {
    return this.svc.createItem(rId, dto);
  }

  @Get('items')
  findItems(@Param('restaurantId') rId: string) {
    return this.svc.findItems(rId);
  }

  @Get('items/featured')
  findFeaturedItems(@Param('restaurantId') rId: string) {
    return this.svc.findFeaturedItems(rId);
  }

  @Patch('items/:itemId')
  @UseGuards(RestaurantAccessGuard)
  updateItem(@Param('itemId') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.svc.updateItem(id, dto);
  }

  @Delete('items/:itemId')
  @UseGuards(RestaurantAccessGuard)
  deleteItem(@Param('itemId') id: string) {
    return this.svc.deleteItem(id);
  }

  // ─── Branch overrides ────────────────────────────────────────────────────────

  @Post('branches/:branchId/overrides/:menuItemId')
  @UseGuards(BranchAccessGuard)
  upsertOverride(
    @Param('branchId') bId: string,
    @Param('menuItemId') mId: string,
    @Body() dto: UpsertOverrideDto,
  ) {
    return this.svc.upsertOverride(bId, mId, dto);
  }

  @Delete('branches/:branchId/overrides/:menuItemId')
  @UseGuards(BranchAccessGuard)
  deleteOverride(@Param('branchId') bId: string, @Param('menuItemId') mId: string) {
    return this.svc.deleteOverride(bId, mId);
  }
}
