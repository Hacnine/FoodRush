import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DeliveryService } from './delivery.service';
import { DeliveryStatus } from './entities/delivery.entity';
import { AssignDriverDto, UpdateDeliveryStatusDto, UpdateDriverLocationDto } from './dto/delivery.dto';

@Controller('delivery')
@UseGuards(AuthGuard('jwt'))
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post('assign')
  async assignDriver(@Body() body: AssignDriverDto) {
    return this.deliveryService.assignDriver(body);
  }

  @Put('status')
  async updateStatus(@Body() body: UpdateDeliveryStatusDto) {
    return this.deliveryService.updateStatus(body.orderId, body.status, body.location);
  }

  @Put('location')
  async updateLocation(@Body() body: UpdateDriverLocationDto) {
    await this.deliveryService.updateDriverLocation(body.orderId, body.lat, body.lng);
    return { success: true };
  }

  @Get('order/:orderId')
  async getByOrder(@Param('orderId') orderId: string) {
    return this.deliveryService.findByOrder(orderId);
  }

  @Get('driver/me')
  async getMyDeliveries(@Request() req) {
    return this.deliveryService.findByDriver(req.user.userId);
  }
}
