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
import type { ChangePasswordDto } from './dto/change-password.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';

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
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('An account with this email already exists.');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenExp = new Date(Date.now() + VERIFICATION_EXPIRES_HOURS * 60 * 60 * 1000);

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

    void this.email.sendVerificationEmail(user.email, user.fullName, verificationToken);

    const tokens = await this.issueTokens({
      sub: user.id,
      email: user.email,
      onboardComplete: false,
    });
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        emailVerified: user.emailVerified,
        onboardComplete: user.onboardComplete,
        staffMember: null,
      },
      ...tokens,
    };
  }

  // ─── Validate (Passport local) ───────────────────────────────────────────────

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new UnauthorizedException('Invalid email or password.');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password.');
    return user;
  }

  // ─── Login ──────────────────────────────────────────────────────────────────

  async login(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const staffMember = await this.resolveStaffMembership(userId);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      onboardComplete: user.onboardComplete,
    };
    if (staffMember) {
      payload.staffRole = staffMember.role;
      payload.branchId = staffMember.branchId;
    }
    const tokens = await this.issueTokens(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        emailVerified: user.emailVerified,
        onboardComplete: user.onboardComplete,
        staffMember,
      },
      ...tokens,
    };
  }

  // ─── Refresh ────────────────────────────────────────────────────────────────

  async refresh(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Session expired. Please sign in again.');

    const staffMember = await this.resolveStaffMembership(userId);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      onboardComplete: user.onboardComplete,
    };
    if (staffMember) {
      payload.staffRole = staffMember.role;
      payload.branchId = staffMember.branchId;
    }
    const tokens = await this.issueTokens(payload);
    return { ...tokens, onboardComplete: user.onboardComplete };
  }

  // ─── Me ─────────────────────────────────────────────────────────────────────

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        emailVerified: true,
        onboardComplete: true,
        createdAt: true,
      },
    });
    if (!user) throw new UnauthorizedException();

    const staffMember = await this.resolveStaffMembership(userId);
    return { ...user, staffMember };
  }

  // ─── Verify email ────────────────────────────────────────────────────────────

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({ where: { verificationToken: token } });
    if (!user) throw new BadRequestException('Invalid or expired verification link.');
    if (user.emailVerified) return { message: 'Email already verified.' };
    if (!user.verificationTokenExp || user.verificationTokenExp < new Date())
      throw new BadRequestException('Verification link has expired. Request a new one.');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null, verificationTokenExp: null },
    });
    void this.email.sendWelcomeEmail(user.email, user.fullName);
    return { message: 'Email verified successfully.' };
  }

  // ─── Resend verification ─────────────────────────────────────────────────────

  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');
    if (user.emailVerified) throw new BadRequestException('Email is already verified.');

    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenExp = new Date(Date.now() + VERIFICATION_EXPIRES_HOURS * 60 * 60 * 1000);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationToken, verificationTokenExp },
    });
    void this.email.sendVerificationEmail(user.email, user.fullName, verificationToken);
    return { message: 'Verification email sent.' };
  }

  // ─── Forgot password ─────────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user)
      return { message: 'If an account exists for that email, a reset link has been sent.' };

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
    const user = await this.prisma.user.findUnique({ where: { passwordResetToken: dto.token } });
    if (!user) throw new BadRequestException('Invalid or expired reset link.');
    if (!user.passwordResetTokenExp || user.passwordResetTokenExp < new Date())
      throw new BadRequestException('Reset link has expired. Request a new one.');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordResetToken: null, passwordResetTokenExp: null },
    });
    return { message: 'Password reset successfully. You can now sign in.' };
  }

  // ─── Logout ──────────────────────────────────────────────────────────────────

  async logout() {
    return { success: true };
  }

  // ─── Google OAuth ────────────────────────────────────────────────────────────

  async validateGoogleUser(profile: any) {
    const email = profile.email.toLowerCase();
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Auto-create user from Google profile
      user = await this.prisma.user.create({
        data: {
          email,
          fullName: profile.fullName || profile.firstName || 'Google User',
          passwordHash: '', // No password for OAuth users
          emailVerified: true, // Google emails are verified
        },
      });
    }

    return user;
  }

  // ─── Change Password ─────────────────────────────────────────────────────────

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');

    // If old password is provided, verify it
    if (dto.oldPassword) {
      const valid = await bcrypt.compare(dto.oldPassword, user.passwordHash);
      if (!valid) throw new UnauthorizedException('Current password is incorrect.');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password changed successfully.' };
  }

  // ─── Update Profile ─────────────────────────────────────────────────────────

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.fullName && { fullName: dto.fullName }),
        ...(dto.phone && { phone: dto.phone }),
      },
    });

    return {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      phone: updated.phone,
      emailVerified: updated.emailVerified,
      onboardComplete: updated.onboardComplete,
    };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  /**
   * Resolves a user's active staff membership (if they are staff — not an owner).
   * Returns null if the user is a restaurant owner or has no staff membership.
   */
  private async resolveStaffMembership(userId: string) {
    // If the user owns a restaurant, they are NOT a staff member
    const ownsRestaurant = await this.prisma.restaurant.findFirst({
      where: { ownerId: userId },
      select: { id: true },
    });
    if (ownsRestaurant) return null;

    // Find the most recent active staff membership
    const staff = await this.prisma.staffMember.findFirst({
      where: { userId, isActive: true },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            slug: true,
            restaurantId: true,
            restaurant: { select: { id: true, name: true, logoUrl: true } },
          },
        },
      },
      orderBy: { invitedAt: 'desc' },
    });

    if (!staff) return null;

    return {
      id: staff.id,
      branchId: staff.branchId,
      role: staff.role as 'manager' | 'cashier' | 'kitchen',
      branch: {
        id: staff.branch.id,
        name: staff.branch.name,
        slug: staff.branch.slug,
        restaurantId: staff.branch.restaurantId,
        restaurant: staff.branch.restaurant,
      },
    };
  }

  private async issueTokens(payload: JwtPayload): Promise<JwtTokens> {
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET not configured');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload),
      this.jwt.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
