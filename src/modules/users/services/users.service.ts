import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from 'src/utils/typeorm';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
// import { Public } from 'src/decorators/public.decorator';
import { UserAlreadyExistsException } from 'src/utils/exceptions/UserAlreadyExist';
import { UserNotFoundException } from 'src/utils/exceptions/UserNotFound';
import { userSelects } from 'src/utils/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  //CREATING A USER ACCOUNT
  async createANewUser(createUserDto: CreateUserDto): Promise<User> {
    const user = new User(createUserDto);
    const existingUser = await this.usersRepository.findOne({
      where: {
        email: user.email,
      },
    });

    if (existingUser) throw new UserAlreadyExistsException();
    await this.usersRepository.save(user);

    return user;
  }

  //FINDING ALL USERS
  async findAllUsers(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  //FINDING A PARTICULAR USER ACCOUNT
  async findOneUserById(id: number) {
    const user = await this.usersRepository.findOne({
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
  async findOneUserByEmail(email: string, forAuth: boolean) {
    const user = await this.usersRepository.findOne({
      where: {
        email,
      },
    });

    if (user) {
      return user;
    }

    if (forAuth === true) {
      return null;
    } else {
      throw new UserNotFoundException();
    }
  }

  //FINDING A PARTICULAR USER ACCOUNT THROUGH EMAIL
  async findOneUserByEmailAndGetSomeData(email: string) {
    const user = await this.usersRepository.findOne({
      where: {
        email,
      },
      // select: userSelects,
    });

    console.log(user);

    if (user) {
      return user;
    }

    throw new UserNotFoundException();
  }

  //FINDING A PARTICULAR USER ACCOUNT THROUGH FULLNAME
  async findOneUserByFirstName(fullName: string) {
    const user = await this.usersRepository.findOne({ where: { fullName } });

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
    const user = await this.usersRepository.findOneBy({
      id: userId,
      fullName,
    });
    if (!user) {
      throw new UserNotFoundException();
    } else {
      const updated = Object.assign(user, updateUserDto);
      await this.usersRepository.save(updated);
    }
  }

  //DELETING A PARTICULAR USER ACCOUNT
  async deleteAUser(userId: number, fullName: string) {
    if (!userId && !fullName) {
      throw new UnauthorizedException('No userId');
    }

    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
        fullName,
      },
    });
    if (!user) {
      throw new UnauthorizedException();
    } else {
      await this.usersRepository.remove(user);
    }
  }
}
