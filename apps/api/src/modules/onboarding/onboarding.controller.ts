import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { OnboardingStepDto } from './dto/onboarding-step.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '@tableo/types';

@ApiTags('Onboarding')
@ApiBearerAuth()
@Controller('onboarding')
export class OnboardingController {
  constructor(private svc: OnboardingService) {}

  /** Get current onboarding state — used to resume where they left off */
  @Get('state')
  getState(@CurrentUser() user: JwtPayload) {
    return this.svc.getState(user.sub);
  }

  /** Save a step's data and advance */
  @Patch('step')
  saveStep(@CurrentUser() user: JwtPayload, @Body() dto: OnboardingStepDto) {
    return this.svc.saveStep(user.sub, dto);
  }

  @Get('slug-check')
  checkSlug(@CurrentUser() user: JwtPayload, @Query('slug') slug: string) {
    return this.svc.checkSlug(slug, user.sub);
  }
}
