import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Restaurant, RestaurantDocument } from './schemas/restaurant.schema';
import { MenuItem, MenuItemDocument } from './schemas/menu-item.schema';
import { CreateRestaurantDto, CreateMenuItemDto } from './dto/restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
  ) {}

  async create(ownerId: string, dto: CreateRestaurantDto): Promise<Restaurant> {
    const restaurant = new this.restaurantModel({ ...dto, ownerId });
    return restaurant.save();
  }

  async findAll(query: { city?: string; category?: string; search?: string; page?: number; limit?: number }) {
    const { city, category, search, page = 1, limit = 20 } = query;
    const filter: any = { isActive: true };

    if (city) filter.city = new RegExp(city, 'i');
    if (category) filter.categories = category;
    if (search) filter.$text = { $search: search };

    const [data, total] = await Promise.all([
      this.restaurantModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ rating: -1 })
        .exec(),
      this.restaurantModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.findById(id).exec();
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    return restaurant;
  }

  async update(id: string, ownerId: string, dto: Partial<CreateRestaurantDto>): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.findById(id);
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException('Not authorized');

    Object.assign(restaurant, dto);
    return restaurant.save();
  }

  async getMenu(restaurantId: string) {
    await this.findById(restaurantId);
    const items = await this.menuItemModel
      .find({ restaurantId: new Types.ObjectId(restaurantId), isAvailable: true })
      .sort({ category: 1, name: 1 })
      .exec();

    const grouped: Record<string, any[]> = {};
    for (const item of items) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    }
    return grouped;
  }

  async addMenuItem(restaurantId: string, ownerId: string, dto: CreateMenuItemDto): Promise<MenuItem> {
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException('Not authorized');

    const item = new this.menuItemModel({
      ...dto,
      restaurantId: new Types.ObjectId(restaurantId),
    });
    return item.save();
  }

  async updateMenuItem(itemId: string, ownerId: string, dto: Partial<CreateMenuItemDto>): Promise<MenuItem> {
    const item = await this.menuItemModel.findById(itemId).exec();
    if (!item) throw new NotFoundException('Menu item not found');

    const restaurant = await this.restaurantModel.findById(item.restaurantId);
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException('Not authorized');

    Object.assign(item, dto);
    return item.save();
  }

  async deleteMenuItem(itemId: string, ownerId: string): Promise<void> {
    const item = await this.menuItemModel.findById(itemId).exec();
    if (!item) throw new NotFoundException('Menu item not found');

    const restaurant = await this.restaurantModel.findById(item.restaurantId);
    if (restaurant.ownerId !== ownerId) throw new ForbiddenException('Not authorized');

    await item.deleteOne();
  }

  async findMenuItemById(itemId: string): Promise<MenuItem> {
    const item = await this.menuItemModel.findById(itemId).exec();
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }
}
