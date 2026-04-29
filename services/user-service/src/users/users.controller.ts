import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Request() req) {
    return this.usersService.upsert(req.user.userId, { email: req.user.email, name: req.user.email });
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Post(':id/addresses')
  async addAddress(@Param('id') id: string, @Body() dto: CreateAddressDto) {
    return this.usersService.addAddress(id, dto);
  }

  @Get(':id/addresses')
  async getAddresses(@Param('id') id: string) {
    return this.usersService.getAddresses(id);
  }

  @Delete(':id/addresses/:addressId')
  async deleteAddress(@Param('id') id: string, @Param('addressId') addressId: string) {
    return this.usersService.deleteAddress(id, addressId);
  }
}
