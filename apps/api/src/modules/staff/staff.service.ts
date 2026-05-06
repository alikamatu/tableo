import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { InviteStaffDto } from './dto/invite-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  /**
   * Invite a user as staff for a branch.
   * The user must already have an account (registered via /auth/register).
   */
  async invite(branchId: string, ownerId: string, dto: InviteStaffDto) {
    // Verify the branch belongs to the caller
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      include: { restaurant: { select: { ownerId: true } } },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    if (branch.restaurant.ownerId !== ownerId) throw new ForbiddenException();

    // Find the user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException('User not found. They must create an account first.');
    }

    // Check duplicate
    const existing = await this.prisma.staffMember.findUnique({
      where: { branchId_userId: { branchId, userId: user.id } },
    });
    if (existing) throw new ConflictException('User is already staff at this branch');

    return this.prisma.staffMember.create({
      data: {
        branchId,
        userId: user.id,
        role: dto.role,
      },
      include: { user: { select: { id: true, email: true, fullName: true } } },
    });
  }

  /**
   * List all staff members for a branch.
   */
  findByBranch(branchId: string) {
    return this.prisma.staffMember.findMany({
      where: { branchId },
      include: {
        user: { select: { id: true, email: true, fullName: true, phone: true } },
      },
      orderBy: { invitedAt: 'desc' },
    });
  }

  /**
   * Update a staff member's role or active status.
   */
  async update(branchId: string, staffId: string, ownerId: string, dto: UpdateStaffDto) {
    const staff = await this.prisma.staffMember.findUnique({
      where: { id: staffId },
      include: { branch: { include: { restaurant: { select: { ownerId: true } } } } },
    });
    if (!staff || staff.branchId !== branchId) {
      throw new NotFoundException('Staff member not found');
    }
    if (staff.branch.restaurant.ownerId !== ownerId) throw new ForbiddenException();

    return this.prisma.staffMember.update({
      where: { id: staffId },
      data: dto,
      include: { user: { select: { id: true, email: true, fullName: true } } },
    });
  }

  /**
   * Remove a staff member from a branch.
   */
  async remove(branchId: string, staffId: string, ownerId: string) {
    const staff = await this.prisma.staffMember.findUnique({
      where: { id: staffId },
      include: { branch: { include: { restaurant: { select: { ownerId: true } } } } },
    });
    if (!staff || staff.branchId !== branchId) {
      throw new NotFoundException('Staff member not found');
    }
    if (staff.branch.restaurant.ownerId !== ownerId) throw new ForbiddenException();

    return this.prisma.staffMember.delete({ where: { id: staffId } });
  }
}
