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
import { CurrentUser } from '../../auth/guard/auth.guard';
import { Public } from '../../decorators/public.decorator';
import { FirebaseAuthGuard } from 'src/auth/guard/firebase.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse()
  @ApiConflictResponse({ description: 'User already exists!.' })
  @ApiBadRequestResponse({ description: 'Something is missing and wrong!' })
  @ApiNotFoundResponse({ description: 'User not found!' })
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
  @ApiNotFoundResponse({ description: 'Id not found' })
  @ApiOkResponse()
  async findOne(@Param('id') id: string) {
    return this.usersService.findOneUserById(+id);
  }

  @Get(':firstName')
  @UseGuards(FirebaseAuthGuard)
  @ApiNotFoundResponse({ description: 'Id not found' })
  @ApiOkResponse()
  async findOneByFistName(@Param('firstName') id: string) {
    return this.usersService.findOneUserById(+id);
  }

  @Put(':firstName')
  @UseGuards(FirebaseAuthGuard)
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
  @UseGuards(FirebaseAuthGuard)
  @ApiNotFoundResponse({ description: 'Id not found' })
  async remove(
    @CurrentUser('id') userId: number,
    @Param('firstName') firstName: string,
  ) {
    return this.usersService.deleteAUser(userId, firstName);
  }
}
