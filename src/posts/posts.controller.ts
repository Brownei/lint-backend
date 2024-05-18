import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/guard/auth.guard';
import { FirebaseAuthGuard } from 'src/auth/guard/firebase.guard';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser('email') email: string,
  ) {
    return await this.postsService.create(createPostDto, email);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  async findAll() {
    return await this.postsService.findAll();
  }

  @Get('/username/:username')
  @UseGuards(FirebaseAuthGuard)
  async findAllPostConcerningAUser(@Param('username') username: string) {
    return await this.postsService.findAllPostConcerningAUser(username);
  }

  @Get('/:id')
  @UseGuards(FirebaseAuthGuard)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.postsService.findOne(id);
  }

  @Delete('/:id')
  @UseGuards(FirebaseAuthGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.remove(+id);
  }
}
