import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/guard/auth.guard';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser('email') email: string,
  ) {
    return await this.postsService.create(createPostDto, email);
  }

  @Get()
  async findAll() {
    return await this.postsService.findAll();
  }

  @Get('/username/:username')
  async findAllPostConcerningAUser(@Param('username') username: string) {
    return await this.postsService.findAllPostConcerningAUser(username);
  }

  @Get('/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.postsService.findOne(id);
  }

  @Delete('/:id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return  this.postsService.remove(+id);
  }
}
