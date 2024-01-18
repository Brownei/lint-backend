import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ShakeUser } from 'src/utils/typeorm';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/utils/typeorm';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ShakeUser)
    private readonly shakeUserRepository: Repository<ShakeUser>,
  ) {}

  //SHAKING A USER
  async shakeAndUnshakeAUser(followedfirstName: string, followerId: number) {
    if (!followedfirstName && !followerId) {
      throw new ConflictException('You need someone to shake');
    }

    const userFollowing = await this.userRepository.findOne({
      where: {
        id: followerId,
      },
    });
    const userFollowed = await this.userRepository.findOne({
      where: {
        firstName: followedfirstName,
      },
    });

    if (!userFollowing || !userFollowed) {
      throw new UnauthorizedException();
    } else if (userFollowing.firstName === followedfirstName) {
      throw new ConflictException('You cannot follow yourself');
    }

    const alreadyFollowing = await this.shakeUserRepository.findOne({
      where: {
        userFollowed: userFollowed.id,
        userId: userFollowing.id,
      },
    });

    const shakeUser = new ShakeUser({
      userFollowed: userFollowed.id,
      userId: userFollowing.id,
    });

    if (alreadyFollowing) {
      await this.shakeUserRepository.delete({
        userFollowed: userFollowed.id,
        userId: userFollowing.id,
      });
      throw new HttpException(
        `Hello ${userFollowing.firstName}, You have successfully unfollowed ${userFollowed.firstName} ${userFollowed.lastName}`,
        HttpStatus.OK,
      );
    } else {
      await this.shakeUserRepository.save(shakeUser);
      throw new HttpException(
        `Hello ${userFollowing.firstName}, You have successfully followed ${userFollowed.firstName} ${userFollowed.lastName}`,
        HttpStatus.OK,
      );
    }
  }

  //GET MY PROFILE
  async getProfile(firstName: string, userId: number) {
    const currentProfile = await this.userRepository.findOne({
      where: {
        firstName,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, password, ...otherDetails } = currentProfile;

    if (id !== userId) {
      return otherDetails;
    }

    return currentProfile;
  }
}
