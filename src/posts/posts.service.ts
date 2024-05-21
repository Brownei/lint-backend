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
import { prisma } from '../prisma.module';
import { ProfileService } from '../users/services/profile.service';

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
        toolsTags: createPostDto.toolsTags.map((tags) => tags),
        title: createPostDto.title,
        profileId: profile.id as number,
      },
    });

    return new HttpException('Created', HttpStatus.CREATED);
  }

  async findAll() {
    return await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
        profile: true,
        description: true,
        id: true,
        requests: true,
        title: true,
        toolsTags: true,
      },
    });
  }

  async findOne(id: string) {
    const particularPost = await prisma.post.findUnique({
      where: {
        id,
      },
      select: {
        createdAt: true,
        profile: true,
        description: true,
        id: true,
        requests: true,
        title: true,
        toolsTags: true,
      },
    });

    if (!particularPost) throw new PostNotFoundException();

    return particularPost;
  }

  async findAllPostConcerningAUser(username: string) {
    const profile = await prisma.profile.findUnique({
      where: {
        username,
      },
    });

    if (!profile) throw new UnauthorizedException();

    return await prisma.post.findMany({
      where: {
        profileId: profile.id,
      },
      select: {
        createdAt: true,
        profile: true,
        description: true,
        id: true,
        requests: true,
        title: true,
        toolsTags: true,
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
