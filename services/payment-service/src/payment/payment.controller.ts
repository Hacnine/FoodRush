import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  RawBodyRequest,
  Req,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';
import { CreatePaymentIntentDto } from './dto/payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createIntent(@Request() req, @Body() dto: CreatePaymentIntentDto) {
    return this.paymentService.createPaymentIntent(req.user.userId, dto);
  }

  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: RawBodyRequest<any>,
  ) {
    return this.paymentService.handleWebhook(sig, req.rawBody);
  }

  @Get('order/:orderId')
  @UseGuards(AuthGuard('jwt'))
  async getByOrder(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentByOrder(orderId);
  }
}
