import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UsersService } from '../users/services/users.service';
import { PostNotFoundException } from './exceptions/PostNotFoundException';
import { prisma } from 'src/prisma.module';
import { ProfileService } from '../users/services/profile.service';
import { Post } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(
    @Inject(UsersService)
    private readonly usersService: UsersService,
    @Inject(ProfileService)
    private readonly profileService: ProfileService,
  ) {}
  async create(createPostDto: CreatePostDto, email: string) {
    const profile = await this.profileService.getProfileThroughUserEmail(email);
    if (!profile) throw new UnauthorizedException();

    await prisma.post.create({
      data: {
        description: createPostDto.description,
        isPaid: createPostDto.IsPaid,
        problem: createPostDto.problem,
        requirements: createPostDto.requirements,
        solution: createPostDto.solution,
        techStacks: createPostDto.techStacks,
        title: createPostDto.title,
        profileId: profile.id as number,
      },
    });

    return new HttpException('Created', HttpStatus.CREATED);
  }

  async findAll() {
    return await prisma.post.findMany({
      select: {
        profile: {
          select: {
            id: true,
            profileImage: true,
            username: true,
          },
        },
      },
    });
  }

  async findOne(id: number): Promise<Post> {
    const particularPost = await prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!particularPost) throw new PostNotFoundException();

    return particularPost;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
