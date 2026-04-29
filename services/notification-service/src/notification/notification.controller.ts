import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('OrderCreated')
  async handleOrderCreated(@Payload() data: { orderId: string; userId: string; total: number }) {
    await this.notificationService.sendOrderCreated(data.orderId, data.userId, data.total);
  }

  @EventPattern('OrderStatusUpdated')
  async handleOrderStatusUpdated(
    @Payload() data: { orderId: string; userId: string; status: string },
  ) {
    await this.notificationService.sendOrderStatusUpdate(data.orderId, data.userId, data.status);
  }

  @EventPattern('OrderDelivered')
  async handleOrderDelivered(@Payload() data: { orderId: string; userId: string }) {
    await this.notificationService.sendOrderStatusUpdate(data.orderId, data.userId, 'delivered');
  }

  @EventPattern('PaymentCompleted')
  async handlePaymentCompleted(
    @Payload() data: { orderId: string; userId: string; paymentId: string },
  ) {
    await this.notificationService.sendPaymentCompleted(data.orderId, data.userId, data.paymentId);
  }

  @EventPattern('PaymentFailed')
  async handlePaymentFailed(@Payload() data: { orderId: string; userId: string }) {
    await this.notificationService.sendPaymentFailed(data.orderId, data.userId);
  }

  @EventPattern('OrderCancelled')
  async handleOrderCancelled(
    @Payload() data: { orderId: string; userId: string; reason: string },
  ) {
    await this.notificationService.sendOrderCancelled(data.orderId, data.userId, data.reason);
  }
}
