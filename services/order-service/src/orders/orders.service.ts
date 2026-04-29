import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private readonly mqClient: ClientProxy;

  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
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

  async create(userId: string, dto: CreateOrderDto): Promise<Order> {
    const subtotal = dto.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryFee = dto.deliveryFee ?? 2.99;
    const total = parseFloat((subtotal + deliveryFee).toFixed(2));

    const order = this.orderRepo.create({
      userId,
      restaurantId: dto.restaurantId,
      status: OrderStatus.PENDING,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress: dto.deliveryAddress,
      notes: dto.notes,
    });

    const savedOrder = await this.orderRepo.save(order);

    const items = dto.items.map((i) =>
      this.orderItemRepo.create({ ...i, order: savedOrder }),
    );
    await this.orderItemRepo.save(items);

    const fullOrder = await this.findById(savedOrder.id);

    this.mqClient.emit('OrderCreated', {
      orderId: fullOrder.id,
      userId,
      restaurantId: dto.restaurantId,
      total,
      items: dto.items,
    });

    return fullOrder;
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['items'] });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByRestaurant(restaurantId: string): Promise<Order[]> {
    return this.orderRepo.find({
      where: { restaurantId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(orderId: string, status: OrderStatus, actorId: string): Promise<Order> {
    const order = await this.findById(orderId);

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY],
      [OrderStatus.READY]: [OrderStatus.OUT_FOR_DELIVERY],
      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      throw new BadRequestException(`Cannot transition from ${order.status} to ${status}`);
    }

    order.status = status;
    const updated = await this.orderRepo.save(order);

    this.mqClient.emit('OrderStatusUpdated', {
      orderId: order.id,
      userId: order.userId,
      restaurantId: order.restaurantId,
      status,
    });

    if (status === OrderStatus.DELIVERED) {
      this.mqClient.emit('OrderDelivered', {
        orderId: order.id,
        userId: order.userId,
      });
    }

    return updated;
  }

  async cancelOrder(orderId: string, userId: string, reason: string): Promise<Order> {
    const order = await this.findById(orderId);
    if (order.userId !== userId) throw new ForbiddenException('Not authorized');

    const cancellable = [OrderStatus.PENDING, OrderStatus.CONFIRMED];
    if (!cancellable.includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelReason = reason;
    const updated = await this.orderRepo.save(order);

    this.mqClient.emit('OrderCancelled', { orderId, userId, reason });
    return updated;
  }
}
