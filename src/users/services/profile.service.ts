import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UserAlreadyExistsException } from '../exceptions/UserAlreadyExist';
import { prisma } from '../../prisma.module';
import { UserNotFoundException } from '../exceptions/UserNotFound';

@Injectable()
export class ProfileService {
  constructor() {}

  async createProfile(profileDTO: CreateProfileDto, email: string) {
    const existingProfile = await prisma.profile.findUnique({
      where: {
        username: profileDTO.username,
      },
    });

    const currentUser = await prisma.user.findUnique({
      where: {
        email,
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
          userId: currentUser.id,
        },
      });
    }
  }

  //GET PROFILE THROUGH ID
  async getProfileThroughId(id: number, currentUserId: number) {
    const currentProfile = await prisma.profile.findUnique({
      where: {
        id,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId, ...otherDetails } = currentProfile;

    if (currentProfile.id !== currentUserId) {
      return otherDetails;
    }

    return currentProfile;
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
