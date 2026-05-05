import { Module } from '@nestjs/common';
import { PrismaModule } from '../../config/prisma.module';
import { MenuController } from './menu.controller';
import { MenuPublicController } from './menu-public.controller';
import { MenuService } from './menu.service';

@Module({
  imports: [PrismaModule],
  controllers: [MenuController, MenuPublicController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
