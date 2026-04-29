import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DeliveryGateway } from './delivery.gateway';
import { Delivery } from './entities/delivery.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delivery]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'foodrush_jwt_super_secret_2024',
    }),
  ],
  controllers: [DeliveryController],
  providers: [DeliveryService, DeliveryGateway, JwtStrategy],
})
export class DeliveryModule {}
