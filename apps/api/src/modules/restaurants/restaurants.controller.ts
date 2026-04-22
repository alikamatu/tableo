import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '@tableo/types';

@ApiTags('Restaurants')
@ApiBearerAuth()
@Controller('restaurants')
export class RestaurantsController {
  constructor(private svc: RestaurantsService) {}

  /** GET /restaurants — list all restaurants for the authenticated owner */
  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.svc.findAllByOwner(user.sub);
  }

  /** GET /restaurants/:id — get one with full detail */
  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.svc.findOne(id, user.sub);
  }

  /** PATCH /restaurants/:id — update restaurant fields */
  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateRestaurantDto,
  ) {
    return this.svc.update(id, user.sub, dto);
  }

  /** DELETE /restaurants/:id */
  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.svc.remove(id, user.sub);
  }
}
