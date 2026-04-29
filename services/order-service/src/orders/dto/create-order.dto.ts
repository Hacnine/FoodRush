import { IsString, IsArray, IsNumber, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  menuItemId: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0.01)
  price: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class DeliveryAddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;
}

export class CreateOrderDto {
  @IsString()
  restaurantId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
