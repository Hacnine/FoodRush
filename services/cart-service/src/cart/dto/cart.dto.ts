import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  restaurantId: string;

  @IsString()
  itemId: string;

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

export class UpdateCartItemDto {
  @IsString()
  itemId: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}
