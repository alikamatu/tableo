import { Body, Controller, Get, Post, Query, Request, Res, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Response as ExpressResponse } from 'express';
import type { User } from '@prisma/client';

import type { AuthService } from './auth.service';
import type { RegisterDto } from './dto/register.dto';
import type { ForgotPasswordDto } from './dto/forgot-password.dto';
import type { ResetPasswordDto } from './dto/reset-password.dto';
import type { ChangePasswordDto } from './dto/change-password.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '@tableo/types';

/**
 * Generates cookie options for auth tokens.
 * Consistent options are required for the browser to correctly clear cookies.
 */
function getCookieOptions(httpOnly = true) {
  const isProd = process.env['NODE_ENV'] === 'production';
  return {
    httpOnly,
    secure: isProd,
    // Using 'lax' allows the cookie to be sent on top-level redirects (Google Auth)
    sameSite: 'lax' as const,
    path: '/',
    // maxAge is only used when setting, not clearing
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function setAuthCookies(res: ExpressResponse, refreshToken: string, onboardComplete: boolean) {
  res.cookie('refresh_token', refreshToken, getCookieOptions(true));
  res.cookie('onboard_complete', String(onboardComplete), getCookieOptions(false));
}

function clearAuthCookies(res: ExpressResponse) {
  // Clearing must match name, path, and security flags EXACTLY
  const refreshOpts = getCookieOptions(true);
  const onboardOpts = getCookieOptions(false);

  // Remove maxAge as it's not needed for clearing
  const { maxAge: _1, ...refreshClear } = refreshOpts;
  const { maxAge: _2, ...onboardClear } = onboardOpts;

  res.clearCookie('refresh_token', refreshClear);
  res.clearCookie('onboard_complete', onboardClear);
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // ─── Register ──────────────────────────────────────────────────────────────

  @Public()
  @UseGuards(ThrottlerGuard)
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: false }) res: ExpressResponse) {
    const { refreshToken, user, accessToken } = await this.auth.register(dto);
    setAuthCookies(res, refreshToken, user.onboardComplete);
    res.status(201).json({ data: { user, accessToken } });
  }

  // ─── Login ─────────────────────────────────────────────────────────────────

  @Public()
  @UseGuards(ThrottlerGuard, AuthGuard('local'))
  @Post('login')
  async login(
    @Request() req: { user: User & { onboardComplete: boolean } },
    @Res({ passthrough: false }) res: ExpressResponse,
  ) {
    const { refreshToken, user, accessToken } = await this.auth.login(req.user.id);
    setAuthCookies(res, refreshToken, user.onboardComplete);
    res.status(200).json({ data: { user, accessToken } });
  }

  // ─── Logout ────────────────────────────────────────────────────────────────

  @Post('logout')
  async logout(@Res({ passthrough: false }) res: ExpressResponse) {
    clearAuthCookies(res);
    res.status(200).json({ data: { success: true } });
  }

  // ─── Refresh ───────────────────────────────────────────────────────────────

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: false }) res: ExpressResponse,
  ) {
    const { refreshToken, accessToken, onboardComplete } = await this.auth.refresh(user.sub);
    setAuthCookies(res, refreshToken, onboardComplete);
    res.status(200).json({ data: { accessToken } });
  }

  // ─── Me ────────────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.auth.me(user.sub);
  }

  // ─── Google ─────────────────────────────────────────────────────────────────

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Initiates the Google OAuth2 flow
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(
    @Request() req: any,
    @Res({ passthrough: false }) res: ExpressResponse,
  ) {
    const user = await this.auth.validateGoogleUser(req.user);
    const { refreshToken, user: userData } = await this.auth.login(user.id);

    setAuthCookies(res, refreshToken, userData.onboardComplete ?? false);

    // Redirect to frontend dashboard or onboarding
    let redirectUrl = !userData.onboardComplete
      ? `${process.env['APP_URL']}/onboarding`
      : userData.staffMember
        ? `${process.env['APP_URL']}/manager-dashboard`
        : `${process.env['APP_URL']}/dashboard`;

    // Add success flag so frontend knows to set session marker
    redirectUrl += redirectUrl.includes('?') ? '&authenticated=true' : '?authenticated=true';

    res.redirect(redirectUrl);
  }

  // ─── Verify email ──────────────────────────────────────────────────────────

  @Public()
  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.auth.verifyEmail(token);
  }

  // ─── Resend verification ───────────────────────────────────────────────────

  @ApiBearerAuth()
  @Post('resend-verification')
  resendVerification(@CurrentUser() user: JwtPayload) {
    return this.auth.resendVerification(user.sub);
  }

  // ─── Forgot password ───────────────────────────────────────────────────────

  @Public()
  @UseGuards(ThrottlerGuard)
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }

  // ─── Reset password ────────────────────────────────────────────────────────

  @Public()
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  // ─── Change password ───────────────────────────────────────────────────────

  @ApiBearerAuth()
  @Post('change-password')
  changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(user.sub, dto);
  }

  // ─── Update Profile ────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @Patch('profile')
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.auth.updateProfile(user.sub, dto);
  }
}
