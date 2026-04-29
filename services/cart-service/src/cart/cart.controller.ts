import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post('add')
  async addItem(@Request() req, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(req.user.userId, dto);
  }

  @Post('remove')
  async removeItem(@Request() req, @Body('itemId') itemId: string) {
    return this.cartService.removeItem(req.user.userId, itemId);
  }

  @Patch('item')
  async updateItem(@Request() req, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItem(req.user.userId, dto);
  }

  @Delete()
  async clearCart(@Request() req) {
    await this.cartService.clearCart(req.user.userId);
    return { message: 'Cart cleared' };
  }
}
