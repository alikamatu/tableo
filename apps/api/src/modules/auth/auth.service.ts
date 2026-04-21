import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

import { PrismaService } from '../../config/prisma.service';
import { EmailService } from './email.service';
import type { JwtPayload, JwtTokens } from '@tableo/types';
import type { RegisterDto } from './dto/register.dto';
import type { ForgotPasswordDto } from './dto/forgot-password.dto';
import type { ResetPasswordDto } from './dto/reset-password.dto';

const VERIFICATION_EXPIRES_HOURS = 24;
const RESET_EXPIRES_MINUTES = 60;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private email: EmailService,
  ) {}

  // ─── Register ───────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('An account with this email already exists.');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenExp = new Date(
      Date.now() + VERIFICATION_EXPIRES_HOURS * 60 * 60 * 1000,
    );

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone ?? null,
        verificationToken,
        verificationTokenExp,
        emailVerified: false,
      },
    });

    // Send verification email — non-blocking
    void this.email.sendVerificationEmail(user.email, user.fullName, verificationToken);

    const tokens = await this.issueTokens({ sub: user.id, email: user.email });
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        emailVerified: user.emailVerified,
      },
      ...tokens,
    };
  }

  // ─── Login ──────────────────────────────────────────────────────────────────

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) throw new UnauthorizedException('Invalid email or password.');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password.');

    return user;
  }

  async login(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const tokens = await this.issueTokens({ sub: user.id, email: user.email });
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        emailVerified: user.emailVerified,
      },
      ...tokens,
    };
  }

  // ─── Refresh ────────────────────────────────────────────────────────────────

  async refresh(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Session expired. Please sign in again.');
    return this.issueTokens({ sub: user.id, email: user.email });
  }

  // ─── Me ─────────────────────────────────────────────────────────────────────

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
      },
    });
  }

  // ─── Verify email ────────────────────────────────────────────────────────────

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) throw new BadRequestException('Invalid or expired verification link.');
    if (user.emailVerified) return { message: 'Email already verified.' };

    if (!user.verificationTokenExp || user.verificationTokenExp < new Date()) {
      throw new BadRequestException('Verification link has expired. Request a new one.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExp: null,
      },
    });

    // Send welcome email — non-blocking
    void this.email.sendWelcomeEmail(user.email, user.fullName);

    return { message: 'Email verified successfully.' };
  }

  // ─── Resend verification ─────────────────────────────────────────────────────

  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');
    if (user.emailVerified) throw new BadRequestException('Email is already verified.');

    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenExp = new Date(
      Date.now() + VERIFICATION_EXPIRES_HOURS * 60 * 60 * 1000,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationToken, verificationTokenExp },
    });

    void this.email.sendVerificationEmail(user.email, user.fullName, verificationToken);
    return { message: 'Verification email sent.' };
  }

  // ─── Forgot password ─────────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Always return the same response — prevents user enumeration
    if (!user) {
      return { message: 'If an account exists for that email, a reset link has been sent.' };
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetExp = new Date(Date.now() + RESET_EXPIRES_MINUTES * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: resetToken, passwordResetTokenExp: resetExp },
    });

    void this.email.sendPasswordResetEmail(user.email, user.fullName, resetToken);
    return { message: 'If an account exists for that email, a reset link has been sent.' };
  }

  // ─── Reset password ───────────────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { passwordResetToken: dto.token },
    });

    if (!user) throw new BadRequestException('Invalid or expired reset link.');

    if (!user.passwordResetTokenExp || user.passwordResetTokenExp < new Date()) {
      throw new BadRequestException('Reset link has expired. Request a new one.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetTokenExp: null,
      },
    });

    return { message: 'Password reset successfully. You can now sign in.' };
  }

  // ─── Logout ──────────────────────────────────────────────────────────────────

  async logout() {
    return { success: true };
  }

  // ─── Token issuance ──────────────────────────────────────────────────────────

  private async issueTokens(payload: JwtPayload): Promise<JwtTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET')!,
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
