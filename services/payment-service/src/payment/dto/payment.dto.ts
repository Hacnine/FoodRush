import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  orderId: string;

  @IsNumber()
  @Min(0.5)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;
}
