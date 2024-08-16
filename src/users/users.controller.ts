import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    await this.usersService.sendUserCreationNotification(user);
    return user;
  }

  @Get(':userId')
  async findOne(@Param('userId') userId: string) {
    return this.usersService.getUserFromExternalAPI(userId);
  }

  @Get(':userId/avatar')
  async getAvatar(@Param('userId') userId: string) {
    return await this.usersService.getAvatar(userId);
  }

  @Delete(':userId/avatar')
  async deleteAvatar(@Param('userId') userId: string) {
    return this.usersService.deleteAvatar(userId);
  }
}
