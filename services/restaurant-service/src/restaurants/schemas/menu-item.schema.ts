import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MenuItemDocument = MenuItem & Document;

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  imageUrl: string;

  @Prop({ required: true })
  category: string;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ type: [String], default: [] })
  allergens: string[];

  @Prop({ default: 0 })
  preparationTime: number;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
MenuItemSchema.index({ restaurantId: 1, category: 1 });
