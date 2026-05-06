import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import type { BranchesService } from './branches.service';
import type { CreateBranchDto } from './dto/create-branch.dto';
import type { UpdateBranchDto } from './dto/update-branch.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BranchAccessGuard } from '../../common/guards/branch-access.guard';
import type { JwtPayload } from '@tableo/types';

@ApiTags('Branches')
@ApiBearerAuth()
@Controller('restaurants/:restaurantId/branches')
export class BranchesController {
  constructor(private svc: BranchesService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateBranchDto,
  ) {
    return this.svc.create(restaurantId, user.sub, dto);
  }

  @Get()
  findAll(@Param('restaurantId') restaurantId: string) {
    return this.svc.findAllByRestaurant(restaurantId);
  }

  @Get(':branchId')
  @UseGuards(BranchAccessGuard)
  findOne(@Param('branchId') branchId: string) {
    return this.svc.findOne(branchId);
  }

  @Patch(':branchId')
  @UseGuards(BranchAccessGuard)
  update(
    @CurrentUser() user: JwtPayload,
    @Param('branchId') branchId: string,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.svc.update(branchId, user.sub, dto);
  }

  @Delete(':branchId')
  remove(@CurrentUser() user: JwtPayload, @Param('branchId') branchId: string) {
    return this.svc.remove(branchId, user.sub);
  }

  @Get(':branchId/qrcode')
  @UseGuards(BranchAccessGuard)
  async qrCode(@Param('branchId') branchId: string, @Query('baseUrl') baseUrl: string) {
    const branch = await this.svc.findOne(branchId);
    const dataUrl = await this.svc.generateQrCode(branch.slug, baseUrl ?? 'https://tableo.app');
    return { qrCode: dataUrl, menuUrl: `${baseUrl ?? 'https://tableo.app'}/menu/${branch.slug}` };
  }
}
