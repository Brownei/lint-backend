import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CurrentUser } from '../../auth/guard/auth.guard';
import { Public } from '../../decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @Public()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createANewUser(createUserDto);
  }

  @Get()
  async findAll() {
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOneUserById(+id);
  }

  @Get(':firstName')
  async findOneByFistName(@Param('firstName') id: string) {
    return this.usersService.findOneUserById(+id);
  }

  @Put(':firstName')
  async update(
    @CurrentUser('id') userId: number,
    @Param('firstName') firstName: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(userId, firstName, updateUserDto);
  }

  @Delete(':firstName')
  async remove(
    @CurrentUser('id') userId: number,
    @Param('firstName') firstName: string,
  ) {
    return this.usersService.deleteAUser(userId, firstName);
  }
}
