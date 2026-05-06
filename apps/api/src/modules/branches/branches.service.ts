import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../config/prisma.service';
import { generateSlug, BRANCH_LIMITS } from '@tableo/utils';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  private readonly logger = new Logger(BranchesService.name);
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async create(restaurantId: string, ownerId: string, dto: CreateBranchDto) {
    const { managerEmail, managerName, ...branchData } = dto as CreateBranchDto & {
      managerEmail?: string;
      managerName?: string;
    };

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { _count: { select: { branches: true } } },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException();

    const limit = BRANCH_LIMITS[restaurant.plan] ?? 1;
    if (restaurant._count.branches >= limit) {
      throw new BadRequestException(
        `Your ${restaurant.plan} plan allows a maximum of ${limit} branch(es). Upgrade to add more.`,
      );
    }

    const slug = generateSlug(dto.name);
    const tempPassword = `Tableo${Math.floor(1000 + Math.random() * 9000)}!`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    return this.prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({ where: { email: (managerEmail ?? '').toLowerCase() } });
      const isNewUser = !user;

      if (!user && managerEmail) {
        user = await tx.user.create({
          data: {
            email: managerEmail.toLowerCase(),
            fullName: managerName ?? 'Branch Manager',
            passwordHash,
            onboardComplete: true,
          },
        });
      }

      const branch = await tx.branch.create({
        data: { slug, ...branchData, restaurantId },
      });

      if (user) {
        await tx.staffMember.create({
          data: { branchId: branch.id, userId: user.id, role: 'manager' },
        });
      }

      return { ...branch, managerPassword: isNewUser ? tempPassword : null };
    });
  }

  findAllByRestaurant(restaurantId: string) {
    return this.prisma.branch.findMany({ where: { restaurantId }, orderBy: { createdAt: 'asc' } });
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async findBySlug(slug: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { slug },
      include: { restaurant: { select: { name: true, logoUrl: true } } },
    });
    if (!branch || !branch.isActive) throw new NotFoundException('Branch not found');
    return branch;
  }

  async update(id: string, ownerId: string, dto: UpdateBranchDto) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: { restaurant: { select: { ownerId: true } } },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    if (branch.restaurant.ownerId !== ownerId) throw new ForbiddenException();
    return this.prisma.branch.update({ where: { id }, data: dto });
  }

  async remove(id: string, ownerId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: { restaurant: { select: { ownerId: true } } },
    });
    if (!branch) throw new NotFoundException('Branch not found');
    if (branch.restaurant.ownerId !== ownerId) throw new ForbiddenException();
    return this.prisma.branch.delete({ where: { id } });
  }

  async generateQrCode(slug: string, baseUrl: string): Promise<string> {
    const url = `${baseUrl}/menu/${slug}`;
    return QRCode.toDataURL(url, { width: 400, margin: 2 });
  }
}
