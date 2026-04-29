import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Delivery, DeliveryStatus } from './entities/delivery.entity';
import { DeliveryGateway } from './delivery.gateway';

@Injectable()
export class DeliveryService {
  private readonly mqClient: ClientProxy;

  constructor(
    @InjectRepository(Delivery) private readonly deliveryRepo: Repository<Delivery>,
    private readonly deliveryGateway: DeliveryGateway,
  ) {
    this.mqClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
        queue: 'foodrush_events',
        queueOptions: { durable: true },
      },
    });
  }

  async assignDriver(data: {
    orderId: string;
    userId: string;
    deliveryAddress: any;
    driverId?: string;
    driverName?: string;
    driverPhone?: string;
  }): Promise<Delivery> {
    let delivery = await this.deliveryRepo.findOne({ where: { orderId: data.orderId } });

    if (!delivery) {
      delivery = this.deliveryRepo.create({
        orderId: data.orderId,
        userId: data.userId,
        deliveryAddress: data.deliveryAddress,
        driverId: data.driverId,
        driverName: data.driverName,
        driverPhone: data.driverPhone,
        status: DeliveryStatus.ASSIGNED,
      });
    } else {
      delivery.driverId = data.driverId;
      delivery.driverName = data.driverName;
      delivery.driverPhone = data.driverPhone;
    }

    const saved = await this.deliveryRepo.save(delivery);
    this.deliveryGateway.emitDeliveryUpdate(data.orderId, { status: DeliveryStatus.ASSIGNED, delivery: saved });
    return saved;
  }

  async updateStatus(orderId: string, status: DeliveryStatus, location?: { lat: number; lng: number }): Promise<Delivery> {
    const delivery = await this.deliveryRepo.findOne({ where: { orderId } });
    if (!delivery) throw new NotFoundException('Delivery not found');

    delivery.status = status;

    if (location) {
      delivery.currentLatitude = location.lat;
      delivery.currentLongitude = location.lng;
    }

    if (status === DeliveryStatus.DELIVERED) {
      delivery.deliveredAt = new Date();
      this.mqClient.emit('OrderDelivered', {
        orderId: delivery.orderId,
        userId: delivery.userId,
        driverId: delivery.driverId,
      });
    }

    const saved = await this.deliveryRepo.save(delivery);
    this.deliveryGateway.emitDeliveryUpdate(orderId, { status, location, delivery: saved });
    return saved;
  }

  async updateDriverLocation(orderId: string, lat: number, lng: number): Promise<void> {
    await this.deliveryRepo.update({ orderId }, { currentLatitude: lat, currentLongitude: lng });
    this.deliveryGateway.emitLocationUpdate(orderId, { lat, lng });
  }

  async findByOrder(orderId: string): Promise<Delivery> {
    const delivery = await this.deliveryRepo.findOne({ where: { orderId } });
    if (!delivery) throw new NotFoundException('Delivery not found');
    return delivery;
  }

  async findByDriver(driverId: string): Promise<Delivery[]> {
    return this.deliveryRepo.find({ where: { driverId }, order: { createdAt: 'DESC' } });
  }
}
