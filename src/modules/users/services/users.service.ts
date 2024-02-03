import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from 'src/utils/typeorm';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
// import { Public } from 'src/decorators/public.decorator';
import { UserAlreadyExistsException } from 'src/utils/exceptions/UserAlreadyExist';
import { UserNotFoundException } from 'src/utils/exceptions/UserNotFound';
import { UserReturns } from 'src/utils/types/types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  //CREATING A USER ACCOUNT
  async createANewUser(createUserDto: CreateUserDto) {
    const user = new User(createUserDto);
    const existingUser = await this.usersRepository.findOne({
      where: {
        email: user.email,
      },
    });

    if (existingUser) throw new UserAlreadyExistsException();
    await this.usersRepository.save(user);
  }

  //FINDING ALL USERS
  async findAllUsers(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  //FINDING A PARTICULAR USER ACCOUNT
  async findOneUserById(id: number): Promise<UserReturns> {
    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
      select: {
        email: true,
        firstName: true,
        gender: true,
        id: true,
        lastName: true,
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
    const user = await this.usersRepository.findOne({ where: { email } });

    if (user) {
      return user;
    }

    throw new UserNotFoundException();
  }

  async findOneUserByFirstName(firstName: string) {
    const user = await this.usersRepository.findOne({ where: { firstName } });

    if (user) {
      return user;
    }

    throw new UserNotFoundException();
  }

  //UPDATING USER ACCOUNT
  async updateUser(
    userId: number,
    firstName: string,
    updateUserDto: UpdateUserDto,
  ) {
    if (!updateUserDto && !userId) {
      throw new UnauthorizedException();
    }
    const user = await this.usersRepository.findOneBy({
      id: userId,
      firstName: firstName,
    });
    if (!user) {
      throw new UserNotFoundException();
    } else {
      const updated = Object.assign(user, updateUserDto);
      await this.usersRepository.save(updated);
    }
  }

  //DELETING A PARTICULAR USER ACCOUNT
  async deleteAUser(userId: number, firstName: string) {
    if (!userId && !firstName) {
      throw new UnauthorizedException('No userId');
    }

    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
        firstName: firstName,
      },
    });
    if (!user) {
      throw new UnauthorizedException();
    } else {
      await this.usersRepository.remove(user);
    }
  }
}
