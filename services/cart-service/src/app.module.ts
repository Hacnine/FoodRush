import { Module } from '@nestjs/common';
import { CartModule } from './cart/cart.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [RedisModule, CartModule],
})
export class AppModule {}
