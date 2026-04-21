import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { QueryAnalyticsDto } from './dto/query-analytics.dto';
import { BranchAccessGuard } from '../../common/guards/branch-access.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('branches/:branchId/analytics')
export class AnalyticsController {
  constructor(private svc: AnalyticsService) {}

  @Get()
  @UseGuards(BranchAccessGuard)
  getSnapshots(
    @Param('branchId') branchId: string,
    @Query() query: QueryAnalyticsDto,
  ) {
    return this.svc.getSnapshots(branchId, query);
  }

  @Get('live')
  @UseGuards(BranchAccessGuard)
  getLiveSummary(@Param('branchId') branchId: string) {
    return this.svc.getLiveSummary(branchId);
  }
}
