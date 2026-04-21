import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Public Menu')
@Public()
@Controller('menu')
export class MenuPublicController {
  constructor(private svc: MenuService) {}

  @Get(':slug')
  getMenu(@Param('slug') slug: string) {
    return this.svc.resolveMenuForSlug(slug);
  }
}
