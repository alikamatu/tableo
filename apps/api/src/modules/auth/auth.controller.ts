import {
  Body, Controller, Get, Post, Query,
  Request, Res, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Response as ExpressResponse } from 'express';
import type { User } from '@prisma/client';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '@tableo/types';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function setRefreshCookie(res: ExpressResponse, token: string) {
  res.cookie('refresh_token', token, COOKIE_OPTS);
}

function clearRefreshCookie(res: ExpressResponse) {
  res.clearCookie('refresh_token', { ...COOKIE_OPTS, maxAge: 0 });
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // ─── Register ──────────────────────────────────────────────────────────────

  @Public()
  @UseGuards(ThrottlerGuard)
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: false }) res: ExpressResponse,
  ) {
    const { refreshToken, ...data } = await this.auth.register(dto);
    setRefreshCookie(res, refreshToken);
    res.status(201).json({ data });
  }

  // ─── Login ─────────────────────────────────────────────────────────────────

  @Public()
  @UseGuards(ThrottlerGuard, AuthGuard('local'))
  @Post('login')
  async login(
    @Request() req: { user: User },
    @Res({ passthrough: false }) res: ExpressResponse,
  ) {
    const { refreshToken, ...data } = await this.auth.login(req.user.id);
    setRefreshCookie(res, refreshToken);
    res.status(200).json({ data });
  }

  // ─── Logout ────────────────────────────────────────────────────────────────

  @Post('logout')
  async logout(@Res({ passthrough: false }) res: ExpressResponse) {
    clearRefreshCookie(res);
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
    const { refreshToken, ...data } = await this.auth.refresh(user.sub);
    setRefreshCookie(res, refreshToken);
    res.status(200).json({ data });
  }

  // ─── Me ────────────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.auth.me(user.sub);
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
}
