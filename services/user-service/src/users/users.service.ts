import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { Address } from './entities/address.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  async findById(id: string) {
    const user = await this.profileRepo.findOne({
      where: { id },
      relations: ['addresses'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async upsert(id: string, data: Partial<UserProfile>) {
    let user = await this.profileRepo.findOne({ where: { id } });
    if (!user) {
      user = this.profileRepo.create({ id, ...data });
    } else {
      Object.assign(user, data);
    }
    return this.profileRepo.save(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.profileRepo.save(user);
  }

  async addAddress(userId: string, dto: CreateAddressDto) {
    const user = await this.findById(userId);

    if (dto.isDefault) {
      await this.addressRepo.update({ user: { id: userId } }, { isDefault: false });
    }

    const address = this.addressRepo.create({ ...dto, user });
    return this.addressRepo.save(address);
  }

  async getAddresses(userId: string) {
    return this.addressRepo.find({ where: { user: { id: userId } } });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.addressRepo.findOne({
      where: { id: addressId, user: { id: userId } },
    });
    if (!address) throw new NotFoundException('Address not found');
    return this.addressRepo.remove(address);
  }
}
