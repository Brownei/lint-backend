import {
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
// import { UserReturns } from 'src/utils/types/types';

@Injectable()
export class UsersService {
  constructor() {}

  //CREATING A USER ACCOUNT
  async createANewUser(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const existingUser = await prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingUser) throw new UserAlreadyExistsException();

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

    return newUser;
  }

  //FINDING ALL USERS
  async findAllUsers(): Promise<User[]> {
    return await prisma.user.findMany();
  }

  // FIND ALL USERS BY USERNAME
  async findOneUserByUserName(username: string) {
    const user = await prisma.profile.findUnique({
      where: {
        username,
      },
      select: {
        username: true,
        profileImage: true,
        post: true,
        id: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  //FINDING A PARTICULAR USER ACCOUNT
  async findOneUserById(id: number) {
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

    if (!user) {
      throw new UserNotFoundException();
    }

    return user;
  }

  //FINDING A PARTICULAR USER ACCOUNT THROUGH EMAIL
  async findOneUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...otherDetails } = user;

    return otherDetails;
  }

  //FINDING A PARTICULAR USER ACCOUNT THROUGH EMAIL
  async findOneUserByEmailAndGetSomeData(email: string) {
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

    if (user) {
      return user;
    }

    throw new UserNotFoundException();
  }

  //FINDING A PARTICULAR USER ACCOUNT THROUGH FULLNAME
  async findOneUserByFullName(fullName: string) {
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
      return user;
    }

    throw new UserNotFoundException();
  }

  //UPDATING USER ACCOUNT
  async updateUser(
    userId: number,
    fullName: string,
    updateUserDto: UpdateUserDto,
  ) {
    if (!updateUserDto && !userId) {
      throw new UnauthorizedException();
    }
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        fullName,
      },
    });
    if (!user) {
      throw new UserNotFoundException();
    } else {
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          ...updateUserDto,
        },
      });

      return new HttpException('Deleted', HttpStatus.ACCEPTED);
    }
  }

  //DELETING A PARTICULAR USER ACCOUNT
  async deleteAUser(userId: number, fullName: string) {
    if (!userId && !fullName) {
      throw new UnauthorizedException('No userId');
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        fullName,
      },
    });
    if (!user) {
      throw new UnauthorizedException();
    } else {
      await prisma.user.delete({
        where: {
          id: user.id,
        },
      });

      return new HttpException('Deleted', HttpStatus.ACCEPTED);
    }
  }
}
