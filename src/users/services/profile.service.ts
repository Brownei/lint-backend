import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UserAlreadyExistsException } from '../exceptions/UserAlreadyExist';
import { prisma } from '../../prisma.module';
import { UserNotFoundException } from '../exceptions/UserNotFound';
import { Profile } from '@prisma/client';
import { ProfileReturns } from 'src/utils/types/types';

@Injectable()
export class ProfileService {
  constructor() { }

  async createProfile(profileDTO: CreateProfileDto, email: string): Promise<{
    profile?: Profile
    error?: Error
  }> {
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
      return {
        error: new UserAlreadyExistsException()
      }
    }

    if (!currentUser) {
      return {
        error: new UnauthorizedException()
      }
    }

    const newProfile = await prisma.profile.create({
      data: {
        ...profileDTO,
        links: profileDTO.links.map((li) => li),
        userId: currentUser.id,
      },
    });

    return {
      profile: newProfile
    };
  }

  //GET PROFILE THROUGH ID
  async getProfileThroughId(id: number, currentUserId: number): Promise<{
    profile?: Profile | ProfileReturns
    error?: Error
  }> {
    const currentProfile = await prisma.profile.findUnique({
      where: {
        id,
      },
    });

    if (!currentProfile) return {
      error: new NotFoundException('User not found!')
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId, ...otherDetails } = currentProfile;

    if (currentProfile.id !== currentUserId) {
      return {
        profile: otherDetails
      };
    }

    return {
      profile: currentProfile
    };
  }

  //GET MY PROFILE
  async getProfile(username: string, email: string): Promise<{
    profile?: Profile | ProfileReturns
    error?: Error
  }> {
    try {
      const currentProfile = await prisma.profile.findUnique({
        where: {
          username,
        },
      });

      const currentUser = await prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          profile: true,
        },
      });

      if (!currentProfile) return {
        error: new UserNotFoundException()
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId, ...otherDetails } = currentProfile;

      if (currentProfile.id !== currentUser.profile.id) {
        return {
          profile: otherDetails
        };
      }

      return {
        profile: currentProfile
      };
    } catch (error) {
      console.log(error);
      return {
        error: new UnauthorizedException()
      }
    }
  }

  async getProfileThroughUserEmail(email: string): Promise<{
    profile?: Profile
    error?: Error
  }> {
    const currentUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!currentUser) return {
      error: new UserNotFoundException()
    }

    const currentProfile = await prisma.profile.findUnique({
      where: {
        userId: currentUser.id,
      },
    });

    return {
      profile: currentProfile
    };
  }

  async getSomeoneProfileThroughId(id: number): Promise<{
    profile?: Profile
    error?: Error
  }> {
    const currentProfile = await prisma.profile.findUnique({
      where: {
        id,
      },
    });

    if (!currentProfile) return {
      error: new UserNotFoundException()
    }

    return {
      profile: currentProfile
    };
  }
}
