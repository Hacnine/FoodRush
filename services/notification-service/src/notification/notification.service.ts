import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly emailService: EmailService) {}

  async sendOrderCreated(orderId: string, userId: string, total: number): Promise<void> {
    this.logger.log(`Order created notification: orderId=${orderId}, userId=${userId}, total=${total}`);
    // In production, look up user email and send:
    // await this.emailService.sendEmail(userEmail, 'Order Placed!', this.emailService.orderConfirmedEmail(orderId));
  }

  async sendOrderStatusUpdate(orderId: string, userId: string, status: string): Promise<void> {
    this.logger.log(`Order status update: orderId=${orderId}, status=${status}`);
    if (status === 'confirmed') {
      this.logger.log(`Sending order confirmation notification for ${orderId}`);
    } else if (status === 'out_for_delivery') {
      this.logger.log(`Sending out-for-delivery notification for ${orderId}`);
    } else if (status === 'delivered') {
      this.logger.log(`Sending delivered notification for ${orderId}`);
    }
  }

  async sendPaymentCompleted(orderId: string, userId: string, paymentId: string): Promise<void> {
    this.logger.log(`Payment completed: orderId=${orderId}, paymentId=${paymentId}`);
  }

  async sendPaymentFailed(orderId: string, userId: string): Promise<void> {
    this.logger.log(`Payment failed notification: orderId=${orderId}, userId=${userId}`);
  }

  async sendOrderCancelled(orderId: string, userId: string, reason: string): Promise<void> {
    this.logger.log(`Order cancelled notification: orderId=${orderId}, reason=${reason}`);
  }
}
