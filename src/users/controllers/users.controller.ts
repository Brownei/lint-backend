import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CurrentUser } from '../../auth/guard/auth.guard';
import { Public } from '../../decorators/public.decorator';
import { FirebaseAuthGuard } from 'src/auth/guard/firebase.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  @UseGuards(FirebaseAuthGuard)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createANewUser(createUserDto);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  async findAll() {
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.usersService.findOneUserById(+id);
  }

  @Get(':firstName')
  @UseGuards(FirebaseAuthGuard)
  async findOneByFistName(@Param('firstName') id: string) {
    return this.usersService.findOneUserById(+id);
  }

  @Put(':firstName')
  @UseGuards(FirebaseAuthGuard)
  async update(
    @CurrentUser('id') userId: number,
    @Param('firstName') firstName: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(userId, firstName, updateUserDto);
  }

  @Delete(':firstName')
  @UseGuards(FirebaseAuthGuard)
  async remove(
    @CurrentUser('id') userId: number,
    @Param('firstName') firstName: string,
  ) {
    return this.usersService.deleteAUser(userId, firstName);
  }
}
