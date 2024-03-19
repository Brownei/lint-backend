import { Inject, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/utils/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/services/users.service';
import { UserNotFoundException } from 'src/utils/exceptions/UserNotFound';
import { PostNotFoundException } from 'src/utils/exceptions/PostNotFoundException';
import { PostReturns } from 'src/utils/types/types';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {}
  async create(createPostDto: CreatePostDto, email: string) {
    const user =
      await this.usersService.findOneUserByEmailAndGetSomeData(email);
    if (!user) throw new UserNotFoundException();

    const newPosts = new Post();
    newPosts.title = createPostDto.title;
    newPosts.description = createPostDto.description;
    newPosts.problem = createPostDto.problem_to_solve;
    newPosts.solution = createPostDto.solution;
    newPosts.requirements = createPostDto.requirements;
    newPosts.techStacks = createPostDto.tech_stacks;
    newPosts.isPaid = createPostDto.IsPaid;
    newPosts.user = user;

    await this.postRepository.save(newPosts);
  }

  async findAll() {
    return await this.postRepository.find({
      relations: ['profile'],
      select: {
        profile: {
          username: true,
          profileImage: true,
          id: true,
        },
      },
    });
  }

  async findOne(id: number): Promise<PostReturns> {
    const particularPost = await this.postRepository.findOne({
      where: {
        id,
      },
      relations: ['user', 'requests'],
      select: {
        user: {
          fullName: true,
          profileImage: true,
          id: true,
        },
        requests: {
          receiver: {
            id: true,
          },
          sender: {
            id: true,
          },
        },
      },
    });

    if (!particularPost) throw new PostNotFoundException();

    return particularPost;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} ${updatePostDto} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
