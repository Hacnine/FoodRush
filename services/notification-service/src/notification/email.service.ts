import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"FoodRush" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  }

  orderConfirmedEmail(orderId: string): string {
    return `
      <h1>Order Confirmed! 🎉</h1>
      <p>Your order <strong>#${orderId.slice(0, 8)}</strong> has been confirmed.</p>
      <p>We'll notify you when it's being prepared.</p>
    `;
  }

  orderShippedEmail(orderId: string): string {
    return `
      <h1>Your order is on the way! 🚚</h1>
      <p>Order <strong>#${orderId.slice(0, 8)}</strong> is out for delivery.</p>
      <p>Your driver is heading to you now. Track your order in the app!</p>
    `;
  }

  orderDeliveredEmail(orderId: string): string {
    return `
      <h1>Order Delivered! ✅</h1>
      <p>Order <strong>#${orderId.slice(0, 8)}</strong> has been delivered.</p>
      <p>Enjoy your meal! Don't forget to leave a review.</p>
    `;
  }

  paymentFailedEmail(orderId: string): string {
    return `
      <h1>Payment Failed ❌</h1>
      <p>Payment for order <strong>#${orderId.slice(0, 8)}</strong> failed.</p>
      <p>Please try again or use a different payment method.</p>
    `;
  }
}
