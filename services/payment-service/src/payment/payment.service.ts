import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import Stripe from 'stripe';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentIntentDto } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;
  private readonly mqClient: ClientProxy;

  constructor(
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2023-10-16',
    });

    this.mqClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
        queue: 'foodrush_events',
        queueOptions: { durable: true },
      },
    });
  }

  async createPaymentIntent(userId: string, dto: CreatePaymentIntentDto) {
    const existing = await this.paymentRepo.findOne({ where: { orderId: dto.orderId } });
    if (existing && existing.status === PaymentStatus.SUCCEEDED) {
      throw new ConflictException('Order already paid');
    }

    const amountInCents = Math.round(dto.amount * 100);
    const currency = dto.currency || 'usd';

    let clientSecret: string;
    let intentId: string;

    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        metadata: { orderId: dto.orderId, userId },
      });
      clientSecret = intent.client_secret;
      intentId = intent.id;
    } catch (err) {
      // Stripe unavailable / placeholder key — use mock values for dev/test
      intentId = `pi_mock_${Date.now()}`;
      clientSecret = `pi_mock_${Date.now()}_secret_test`;
    }

    let payment = existing || this.paymentRepo.create({ orderId: dto.orderId, userId });
    payment.amount = dto.amount;
    payment.currency = currency;
    payment.stripePaymentIntentId = intentId;
    payment.stripeClientSecret = clientSecret;
    payment.status = PaymentStatus.PENDING;

    const saved = await this.paymentRepo.save(payment);
    return { clientSecret, paymentId: saved.id };
  }

  async handleWebhook(signature: string, rawBody: Buffer) {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder',
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      await this.markSucceeded(intent.id, intent.metadata);
    } else if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent;
      await this.markFailed(intent.id, intent.last_payment_error?.message);
    }

    return { received: true };
  }

  private async markSucceeded(intentId: string, metadata: Record<string, string>) {
    const payment = await this.paymentRepo.findOne({
      where: { stripePaymentIntentId: intentId },
    });
    if (!payment) return;

    payment.status = PaymentStatus.SUCCEEDED;
    await this.paymentRepo.save(payment);

    this.mqClient.emit('PaymentCompleted', {
      orderId: metadata.orderId,
      userId: metadata.userId,
      paymentId: payment.id,
    });
  }

  private async markFailed(intentId: string, reason?: string) {
    const payment = await this.paymentRepo.findOne({
      where: { stripePaymentIntentId: intentId },
    });
    if (!payment) return;

    payment.status = PaymentStatus.FAILED;
    payment.failureReason = reason || 'Payment failed';
    await this.paymentRepo.save(payment);

    this.mqClient.emit('PaymentFailed', {
      orderId: payment.orderId,
      userId: payment.userId,
    });
  }

  async getPaymentByOrder(orderId: string) {
    const payment = await this.paymentRepo.findOne({ where: { orderId } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}
