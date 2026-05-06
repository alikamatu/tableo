import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@tableo/types';

@ApiTags('Staff')
@ApiBearerAuth()
@Controller('branches/:branchId/staff')
export class StaffController {
  constructor(private svc: StaffService) {}

  @Post()
  invite(
    @CurrentUser() user: JwtPayload,
    @Param('branchId') branchId: string,
    @Body() dto: InviteStaffDto,
  ) {
    return this.svc.invite(branchId, user.sub, dto);
  }

  @Get()
  findAll(@Param('branchId') branchId: string) {
    return this.svc.findByBranch(branchId);
  }

  @Patch(':staffId')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('branchId') branchId: string,
    @Param('staffId') staffId: string,
    @Body() dto: UpdateStaffDto,
  ) {
    return this.svc.update(branchId, staffId, user.sub, dto);
  }

  @Delete(':staffId')
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('branchId') branchId: string,
    @Param('staffId') staffId: string,
  ) {
    return this.svc.remove(branchId, staffId, user.sub);
  }
}
