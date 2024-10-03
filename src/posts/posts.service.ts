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
import { PostReturns } from 'src/utils/types/types';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class PostsService {
  constructor(
    @Inject(UsersService)
    private readonly usersService: UsersService,
    @Inject(ProfileService)
    private readonly profileService: ProfileService,
    private readonly socketGateway: SocketGateway
  ) { }
  async create(createPostDto: CreatePostDto, email: string): Promise<{
    error?: Error
    success?: HttpException
  }> {
    const { profile } = await this.profileService.getProfileThroughUserEmail(email);
    if (!profile) return {
      error: new UnauthorizedException()
    }

    const newPost = await prisma.post.create({
      data: {
        description: createPostDto.description,
        toolsTags: createPostDto.toolsTags.map((tags) => tags),
        title: createPostDto.title,
        profileId: profile.id as number,
      },
      include: {
        profile: true,
        requests: true,
      },
    });

    await this.socketGateway.globalAllWebSocketFunction(newPost, 'new-post')

    return {
      success: new HttpException('Created', HttpStatus.CREATED)
    }
  }

  async findAll(): Promise<PostReturns[]> {
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

  async findOne(id: string): Promise<{
    error?: Error
    particularPost?: PostReturns
  }> {
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

    if (!particularPost) return {
      error: new PostNotFoundException()
    }

    return {
      particularPost
    }
  }

  async findAllPostConcerningAUser(username: string): Promise<{
    error?: Error
    posts?: PostReturns[]
  }> {
    const profile = await prisma.profile.findUnique({
      where: {
        username,
      },
    });

    if (!profile) return {
      error: new UnauthorizedException()
    }

    const posts = await prisma.post.findMany({
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

    return {
      posts
    }
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
