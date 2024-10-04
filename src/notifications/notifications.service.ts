import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from 'src/prisma.module';
import { ProfileService } from 'src/users/services/profile.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly profileService: ProfileService
  ) { }

  async findAll(email: string) {
    const currentUser = await this.profileService.getProfileThroughUserEmail(email)
    return await prisma.notification.findMany({
      where: {
        userId: currentUser.profile.id
      }
    })
  }

  async findOne(id: string) {
    const particularNotification = await prisma.notification.findUnique({
      where: {
        id
      }
    })

    if (!particularNotification) {
      throw new NotFoundException('Notification not found!')
    }

    return particularNotification
  }
}
