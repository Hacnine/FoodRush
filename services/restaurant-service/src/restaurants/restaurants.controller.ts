import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto, CreateMenuItemDto } from './dto/restaurant.dto';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Request() req, @Body() dto: CreateRestaurantDto) {
    return this.restaurantsService.create(req.user.userId, dto);
  }

  @Get()
  async findAll(
    @Query('city') city?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.restaurantsService.findAll({ city, category, search, page, limit });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.restaurantsService.findById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Request() req, @Body() dto: Partial<CreateRestaurantDto>) {
    return this.restaurantsService.update(id, req.user.userId, dto);
  }

  @Get(':id/menu')
  async getMenu(@Param('id') id: string) {
    return this.restaurantsService.getMenu(id);
  }

  @Post(':id/menu')
  @UseGuards(AuthGuard('jwt'))
  async addMenuItem(@Param('id') id: string, @Request() req, @Body() dto: CreateMenuItemDto) {
    return this.restaurantsService.addMenuItem(id, req.user.userId, dto);
  }

  @Put(':id/menu/:itemId')
  @UseGuards(AuthGuard('jwt'))
  async updateMenuItem(
    @Param('itemId') itemId: string,
    @Request() req,
    @Body() dto: Partial<CreateMenuItemDto>,
  ) {
    return this.restaurantsService.updateMenuItem(itemId, req.user.userId, dto);
  }

  @Delete(':id/menu/:itemId')
  @UseGuards(AuthGuard('jwt'))
  async deleteMenuItem(@Param('itemId') itemId: string, @Request() req) {
    return this.restaurantsService.deleteMenuItem(itemId, req.user.userId);
  }
}
