import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { DeliveryStatus } from '../entities/delivery.entity';

export class AssignDriverDto {
  @IsString()
  orderId: string;

  @IsString()
  userId: string;

  deliveryAddress: any;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsString()
  driverPhone?: string;
}

export class UpdateDeliveryStatusDto {
  @IsString()
  orderId: string;

  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @IsOptional()
  location?: { lat: number; lng: number };
}

export class UpdateDriverLocationDto {
  @IsString()
  orderId: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}
