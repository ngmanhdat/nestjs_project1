import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
  @Post()
  @ResponseMessage('create a new user')
  async create(@Body() tenbien: CreateUserDto, @User() user: IUser) {
    let newUser = await this.usersService.create(tenbien, user);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    }

  }
  @Get()
  @ResponseMessage('lay danh sach va phan trang')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string)
   {
    return this.usersService.findAll(+currentPage,+limit,qs);
  }

  @Public()
  @Get(':id')
  @ResponseMessage('tim user theo id')
  async findOne(@Param('id') id: string) {
    const find = await this.usersService.findOne(id);

    return find
  }
  @ResponseMessage('update a new user')
  @Patch()
  update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    return this.usersService.update(updateUserDto, user);
  }

  @Delete(':id')
  @ResponseMessage('delete user')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }
}
