import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryModule } from './delivery/delivery.module';
import { Delivery } from './delivery/entities/delivery.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5436,
      database: process.env.DB_NAME || 'delivery_db',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      entities: [Delivery],
      synchronize: true,
    }),
    DeliveryModule,
  ],
})
export class AppModule {}
