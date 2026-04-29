import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

const CART_TTL = 60 * 60 * 24 * 7; // 7 days

export interface CartItem {
  itemId: string;
  restaurantId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Cart {
  userId: string;
  restaurantId: string | null;
  items: CartItem[];
  subtotal: number;
  updatedAt: string;
}

@Injectable()
export class CartService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private cartKey(userId: string): string {
    return `cart:${userId}`;
  }

  async getCart(userId: string): Promise<Cart> {
    const data = await this.redis.get(this.cartKey(userId));
    if (!data) {
      return { userId, restaurantId: null, items: [], subtotal: 0, updatedAt: new Date().toISOString() };
    }
    return JSON.parse(data);
  }

  async addItem(userId: string, dto: AddToCartDto): Promise<Cart> {
    const cart = await this.getCart(userId);

    if (cart.restaurantId && cart.restaurantId !== dto.restaurantId) {
      throw new BadRequestException(
        'Your cart contains items from another restaurant. Clear cart first.',
      );
    }

    const existingIdx = cart.items.findIndex((i) => i.itemId === dto.itemId);
    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += dto.quantity;
    } else {
      cart.items.push({
        itemId: dto.itemId,
        restaurantId: dto.restaurantId,
        name: dto.name,
        price: dto.price,
        quantity: dto.quantity,
        imageUrl: dto.imageUrl,
      });
    }

    cart.restaurantId = dto.restaurantId;
    cart.subtotal = this.calcSubtotal(cart.items);
    cart.updatedAt = new Date().toISOString();

    await this.redis.setex(this.cartKey(userId), CART_TTL, JSON.stringify(cart));
    return cart;
  }

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    cart.items = cart.items.filter((i) => i.itemId !== itemId);

    if (cart.items.length === 0) cart.restaurantId = null;

    cart.subtotal = this.calcSubtotal(cart.items);
    cart.updatedAt = new Date().toISOString();

    await this.redis.setex(this.cartKey(userId), CART_TTL, JSON.stringify(cart));
    return cart;
  }

  async updateItem(userId: string, dto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.getCart(userId);
    const idx = cart.items.findIndex((i) => i.itemId === dto.itemId);

    if (idx < 0) throw new BadRequestException('Item not found in cart');

    if (dto.quantity === 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = dto.quantity;
    }

    if (cart.items.length === 0) cart.restaurantId = null;

    cart.subtotal = this.calcSubtotal(cart.items);
    cart.updatedAt = new Date().toISOString();

    await this.redis.setex(this.cartKey(userId), CART_TTL, JSON.stringify(cart));
    return cart;
  }

  async clearCart(userId: string): Promise<void> {
    await this.redis.del(this.cartKey(userId));
  }

  private calcSubtotal(items: CartItem[]): number {
    return parseFloat(items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2));
  }
}
