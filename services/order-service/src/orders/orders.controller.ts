import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './entities/order.entity';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, dto);
  }

  @Get('me')
  async getMyOrders(@Request() req) {
    return this.ordersService.findByUser(req.user.userId);
  }

  @Get('user/:userId')
  async getOrdersByUser(@Param('userId') userId: string) {
    return this.ordersService.findByUser(userId);
  }

  @Get('restaurant/:restaurantId')
  async getOrdersByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.ordersService.findByRestaurant(restaurantId);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @Request() req,
  ) {
    return this.ordersService.updateStatus(id, status, req.user.userId);
  }

  @Post(':id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.ordersService.cancelOrder(id, req.user.userId, reason);
  }
}
