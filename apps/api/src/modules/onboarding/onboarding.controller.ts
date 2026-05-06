import { Body, Controller, Get, Inject, Patch, Query, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { OnboardingService } from './onboarding.service';
import { OnboardingStepDto } from './dto/onboarding-step.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@tableo/types';
import { AuthService } from '../auth/auth.service';
import { setAuthCookies } from '../auth/auth-cookies';

@ApiTags('Onboarding')
@ApiBearerAuth()
@Controller('onboarding')
export class OnboardingController {
  constructor(
    @Inject(OnboardingService)
    private svc: OnboardingService,
    @Inject(AuthService)
    private auth: AuthService,
  ) {}

  /** Get current onboarding state — used to resume where they left off */
  @Get('state')
  getState(@CurrentUser() user: JwtPayload) {
    return this.svc.getState(user.sub);
  }

  /**
   * Save a step's data and advance. When onboarding completes, re-issue refresh/access tokens
   * so the browser cookie matches `onboardComplete` without a separate `/auth/refresh` call.
   */
  @Patch('step')
  async saveStep(
    @CurrentUser() user: JwtPayload,
    @Body() dto: OnboardingStepDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.svc.saveStep(user.sub, dto);
    if (result.complete) {
      const { refreshToken, accessToken, onboardComplete } = await this.auth.refresh(user.sub);
      setAuthCookies(res, refreshToken, onboardComplete);
      return { ...result, accessToken };
    }
    return result;
  }

  @Get('slug-check')
  checkSlug(@CurrentUser() user: JwtPayload, @Query('slug') slug: string) {
    return this.svc.checkSlug(slug, user.sub);
  }
}
