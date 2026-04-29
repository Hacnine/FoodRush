import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'foodrush_jwt_super_secret_2024',
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, JwtStrategy],
})
export class OrdersModule {}
