import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { UpsertOverrideDto } from './dto/upsert-override.dto';
import { BranchAccessGuard } from '../../common/guards/branch-access.guard';

@ApiTags('Menu')
@ApiBearerAuth()
@Controller('restaurants/:restaurantId')
export class MenuController {
  constructor(private svc: MenuService) {}

  // ─── Categories ─────────────────────────────────────────────────────────────

  @Post('categories')
  createCategory(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.svc.createCategory(restaurantId, dto);
  }

  @Get('categories')
  findCategories(@Param('restaurantId') restaurantId: string) {
    return this.svc.findCategories(restaurantId);
  }

  @Patch('categories/:categoryId')
  updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() dto: Partial<CreateCategoryDto>,
  ) {
    return this.svc.updateCategory(categoryId, dto);
  }

  @Delete('categories/:categoryId')
  deleteCategory(@Param('categoryId') categoryId: string) {
    return this.svc.deleteCategory(categoryId);
  }

  // ─── Items ───────────────────────────────────────────────────────────────────

  @Post('items')
  createItem(@Param('restaurantId') restaurantId: string, @Body() dto: CreateMenuItemDto) {
    return this.svc.createItem(restaurantId, dto);
  }

  @Get('items')
  findItems(@Param('restaurantId') restaurantId: string) {
    return this.svc.findItems(restaurantId);
  }

  @Patch('items/:itemId')
  updateItem(@Param('itemId') itemId: string, @Body() dto: UpdateMenuItemDto) {
    return this.svc.updateItem(itemId, dto);
  }

  @Delete('items/:itemId')
  deleteItem(@Param('itemId') itemId: string) {
    return this.svc.deleteItem(itemId);
  }

  // ─── Branch overrides ────────────────────────────────────────────────────────

  @Post('branches/:branchId/overrides/:menuItemId')
  @UseGuards(BranchAccessGuard)
  upsertOverride(
    @Param('branchId') branchId: string,
    @Param('menuItemId') menuItemId: string,
    @Body() dto: UpsertOverrideDto,
  ) {
    return this.svc.upsertOverride(branchId, menuItemId, dto);
  }

  @Delete('branches/:branchId/overrides/:menuItemId')
  @UseGuards(BranchAccessGuard)
  deleteOverride(
    @Param('branchId') branchId: string,
    @Param('menuItemId') menuItemId: string,
  ) {
    return this.svc.deleteOverride(branchId, menuItemId);
  }
}
