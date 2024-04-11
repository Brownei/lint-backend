import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UserAlreadyExistsException } from 'src/utils/exceptions/UserAlreadyExist';
import { prisma } from 'src/utils/prisma.module';
import { UserNotFoundException } from 'src/utils/exceptions/UserNotFound';

@Injectable()
export class ProfileService {
  constructor() {}

  async createProfile(profileDTO: CreateProfileDto, userId: number) {
    const existingProfile = await prisma.profile.findUnique({
      where: {
        username: profileDTO.username,
      },
    });

    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (existingProfile) {
      throw new UserAlreadyExistsException();
    } else if (!currentUser) {
      throw new UnauthorizedException();
    } else {
      await prisma.profile.create({
        data: {
          ...profileDTO,
          links: profileDTO.links.map((li) => li),
          userId,
        },
      });
    }
  }

  //GET MY PROFILE
  async getProfile(username: string, currentUserId: number) {
    const currentProfile = await prisma.profile.findUnique({
      where: {
        username,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId, ...otherDetails } = currentProfile;

    if (currentProfile.id !== currentUserId) {
      return otherDetails;
    }

    return currentProfile;
  }

  async getProfileThroughUserEmail(email: string) {
    const currentUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!currentUser) throw new UserNotFoundException();

    const currentProfile = await prisma.profile.findUnique({
      where: {
        userId: currentUser.id,
      },
    });

    return currentProfile;
  }
}
