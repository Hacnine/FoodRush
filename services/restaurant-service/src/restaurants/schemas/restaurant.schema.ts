import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RestaurantDocument = Restaurant & Document;

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  ownerId: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop()
  phone: string;

  @Prop()
  imageUrl: string;

  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ default: 0 })
  totalReviews: number;

  @Prop({ default: 30 })
  estimatedDeliveryTime: number;

  @Prop({ default: 2.99 })
  deliveryFee: number;

  @Prop({ default: 0 })
  minimumOrder: number;

  @Prop({ default: true })
  isOpen: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
RestaurantSchema.index({ city: 1, isActive: 1 });
RestaurantSchema.index({ name: 'text', description: 'text' });
