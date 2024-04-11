import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CurrentUser } from 'src/auth/guard/auth.guard';
import { Routes } from 'src/utils/constants';
import { Public } from 'src/decorators/public.decorator';

@ApiTags('users')
@Controller(Routes.USERS)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse()
  @ApiConflictResponse({ description: 'User already exists!.' })
  @ApiBadRequestResponse({ description: 'Something is missing and wrong!' })
  @ApiNotFoundResponse({ description: 'User not found!' })
  @Public()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createANewUser(createUserDto);
  }

  @Get()
  async findAll() {
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  @ApiNotFoundResponse({ description: 'Id not found' })
  @ApiOkResponse()
  async findOne(@Param('id') id: string) {
    return this.usersService.findOneUserById(+id);
  }

  @Get(':firstName')
  @ApiNotFoundResponse({ description: 'Id not found' })
  @ApiOkResponse()
  async findOneByFistName(@Param('firstName') id: string) {
    return this.usersService.findOneUserById(+id);
  }

  @Put(':firstName')
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: 'Id not found' })
  async update(
    @CurrentUser('id') userId: number,
    @Param('firstName') firstName: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(userId, firstName, updateUserDto);
  }

  @Delete(':firstName')
  @ApiNotFoundResponse({ description: 'Id not found' })
  async remove(
    @CurrentUser('id') userId: number,
    @Param('firstName') firstName: string,
  ) {
    return this.usersService.deleteAUser(userId, firstName);
  }
}
