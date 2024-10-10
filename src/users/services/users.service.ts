import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
// import { Public } from 'src/decorators/public.decorator';
import { UserAlreadyExistsException } from '../exceptions/UserAlreadyExist';
import { UserNotFoundException } from '../exceptions/UserNotFound';
import { User } from '@prisma/client';
import { prisma } from '../../prisma.module';
import * as bcrypt from 'bcrypt';
import { ProfileReturns, UserDetails, UserReturns } from 'src/utils/types/types';
// import { UserReturns } from 'src/utils/types/types';

@Injectable()
export class UsersService {
  constructor() { }

  //CREATING A USER ACCOUNT
  async createANewUser(createUserDto: CreateUserDto): Promise<{
    user?: UserReturns
    error?: Error
  }> {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    const existingUser = await prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingUser) return {
      error: new UserAlreadyExistsException()
    }

    const newUser = await prisma.user.create({
      data: {
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        emailVerified: createUserDto.emailVerified,
        profileImage: createUserDto.profileImage,
        password: hashedPassword,
      },
      select: {
        email: true,
        emailVerified: true,
        fullName: true,
        id: true,
        profile: true,
        profileImage: true,
      },
    });

    return {
      user: newUser
    };
  }

  //FINDING ALL USERS
  async findAllUsers(): Promise<User[]> {
    return await prisma.user.findMany();
  }

  // FIND ALL USERS BY USERNAME
  async findOneUserByUserName(username: string): Promise<{
    user?: ProfileReturns
    error?: Error
  }> {
    const user = await prisma.profile.findUnique({
      where: {
        username,
      },
      select: {
        username: true,
        profileImage: true,
        post: true,
        id: true,
        fullName: true,
        occupation: true,
        bio: true,
        location: true
      },
    });

    if (!user) {
      return {
        error: new UnauthorizedException()
      }
    }

    return {
      user
    };
  }

  //FINDING A PARTICULAR USER ACCOUNT
  async findOneUserById(id: number): Promise<{
    user?: UserDetails
    error?: Error
  }> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        email: true,
        fullName: true,
        id: true,
        profileImage: true,
      },
    });

    if (!user) return {
      error: new UserNotFoundException()
    }

    return {
      user: user
    };
  }

  //FINDING A PARTICULAR USER ACCOUNT THROUGH EMAIL
  async findOneUserByEmail(email: string): Promise<{
    error?: Error
    user?: UserDetails
  }> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) return {
      error: new UserNotFoundException()
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...otherDetails } = user;

    return {
      user: otherDetails
    };
  }

  //FINDING A PARTICULAR USER ACCOUNT THROUGH EMAIL
  async findOneUserByEmailAndGetSomeData(email: string): Promise<{
    user?: UserDetails
    error?: Error
  }> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        email: true,
        fullName: true,
        profile: true,
        id: true,
        emailVerified: true,
        profileImage: true,
      },
    });

    if (user) return {
      user: user
    }

    return {
      error: new UserNotFoundException()
    }
  }

  //FINDING A PARTICULAR USER ACCOUNT THROUGH FULLNAME
  async findOneUserByFullName(fullName: string): Promise<{
    user?: UserDetails
    error?: Error
  }> {
    const user = await prisma.user.findFirst({
      where: { fullName },
      select: {
        email: true,
        fullName: true,
        id: true,
        profileImage: true,
      },
    });

    if (user) {
      return {
        user: user
      };
    }

    return {
      error: new UserNotFoundException()
    }
  }

  //UPDATING USER ACCOUNT
  async updateUser(
    userId: number,
    fullName: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{
    success?: HttpException
    error?: Error
  }> {
    if (!updateUserDto && !userId) {
      return {
        error: new UnauthorizedException()
      }
    }
    const user = await prisma.profile.findFirst({
      where: {
        id: userId,
        fullName,
      },
    });

    if (!user) {
      return {
        error: new UserNotFoundException()
      }
    } else {
      await prisma.profile.update({
        where: {
          id: userId,
        },
        data: {
          ...updateUserDto,
        },
      });

      return {
        success: new HttpException('Deleted', HttpStatus.ACCEPTED)
      }
    }
  }

  //DELETING A PARTICULAR USER ACCOUNT
  async deleteAUser(userId: number, fullName: string): Promise<{
    success?: HttpException
    error?: Error
  }> {
    if (!userId && !fullName) {
      return {
        error: new UnauthorizedException('No userId')
      }
    }

    const currentProfile = await prisma.profile.findFirst({
      where: {
        id: userId,
        fullName,
      },
    });

    const currentUser = await prisma.user.findUnique({
      where: {
        id: currentProfile.userId
      }
    })

    if (!currentProfile && !currentUser) {
      return {
        error: new ConflictException()
      }
    } else {

      await prisma.profile.delete({
        where: {
          id: currentProfile.id,
        },
      });

      await prisma.user.delete({
        where: {
          id: currentUser.id
        }
      })

      return {
        success: new HttpException('Deleted', HttpStatus.ACCEPTED)
      }
    }
  }
}
