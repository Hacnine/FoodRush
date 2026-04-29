import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'foodrush_jwt_super_secret_2024',
    }),
  ],
  controllers: [CartController],
  providers: [CartService, JwtStrategy],
})
export class CartModule {}
