import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuPublicController } from './menu-public.controller';
import { MenuService } from './menu.service';

@Module({
  controllers: [MenuController, MenuPublicController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
