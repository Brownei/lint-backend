import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from 'src/prisma.module';
import { ProfileService } from 'src/users/services/profile.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly profileService: ProfileService
  ) { }

  async findAll(email: string) {
    const { profile } = await this.profileService.getProfileThroughUserEmail(email)
    return await prisma.notification.findMany({
      where: {
        receiverId: profile.id
      },
      include: {
        receiver: {
          select: {
            fullName: true,
            profileImage: true
          }
        },
        sender: {
          select: {
            fullName: true,
            profileImage: true
          }
        },
        request: {
          select: {
            id: true,
            postId: true
          }
        }
      }
    })
  }

  async findOne(id: string) {
    const particularNotification = await prisma.notification.findUnique({
      where: {
        id
      },
      include: {
        receiver: {
          select: {
            fullName: true,
            profileImage: true
          }
        },
        sender: {
          select: {
            fullName: true,
            profileImage: true
          }
        },
        request: {
          select: {
            id: true,
            postId: true
          }
        }
      }
    })

    if (!particularNotification) {
      throw new NotFoundException('Notification not found!')
    }

    return particularNotification
  }
}
