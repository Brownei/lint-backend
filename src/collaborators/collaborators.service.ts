import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CollaboratorNotFoundException } from './exceptions/CollaboratorNotFound';
import { DeleteCollaboratorException } from './exceptions/DeleteCollaborator';
import { prisma } from '../prisma.module';
import { Collaborators } from '@prisma/client';
import { CollaboratorsReturns } from 'src/utils/types/types';
import { UserNotFoundException } from 'src/users/exceptions/UserNotFound';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class CollaboratorsService {
  constructor(
    private readonly socketGateway: SocketGateway
  ) { }

  async createCollaborators(senderId: number, receiverId: number): Promise<{
    success?: HttpException;
    error?: Error
  }> {
    const activelyCollaborating = await this.isCurrentlyCollaborating(
      senderId,
      receiverId,
    );

    if (activelyCollaborating)
      return {
        error: new ConflictException('You guys are currently collaborating')
      }

    await prisma.collaborators.create({
      data: {
        receiverId,
        senderId,
      },
    });

    return {
      success: new HttpException('Created', HttpStatus.CREATED)
    }
  }

  async getAllCollaborators(email: string): Promise<{
    error?: Error
    collaborators?: CollaboratorsReturns[]
  }> {
    const { id } = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (!id) return {
      error: new UnauthorizedException('No access')
    }
    const collaborators = await prisma.collaborators.findMany({
      where: {
        OR: [
          {
            receiverId: id,
          },
          {
            senderId: id,
          },
        ],
      },
      select: {
        receiver: {
          select: {
            profileImage: true,
            fullName: true,
            occupation: true
          },
        },
        sender: {
          select: {
            profileImage: true,
            fullName: true,
            occupation: true
          },
        },
      },
    });


    return {
      collaborators
    }
  }

  async getAllCollaboratorsConcerningAUser(email: string, username: string): Promise<{
    error?: Error
    collaborators?: CollaboratorsReturns[]
  }> {
    const { id } = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (!id) return {
      error: new UnauthorizedException('No access')
    }

    const profile = await prisma.profile.findUnique({
      where: {
        username
      }
    })

    if (!profile) return {
      error: new UserNotFoundException()
    }

    if (profile.userId === id) {
      return this.getAllCollaborators(email)
    }

    const collaborators = await prisma.collaborators.findMany({
      where: {
        OR: [
          {
            receiverId: id,
          },
          {
            senderId: id,
          },
        ],
      },
      select: {
        receiver: {
          select: {
            profileImage: true,
            fullName: true,
            occupation: true
          },
        },
        sender: {
          select: {
            profileImage: true,
            fullName: true,
            occupation: true
          },
        },
      },
    });


    return {
      collaborators
    }

  }

  async findCollaboratorById(id: number): Promise<{
    collaborator?: Collaborators
    error?: Error
  }> {
    const collaborator = await prisma.collaborators.findUnique({
      where: {
        id,
      },
    });

    if (!collaborator) return {
      error: new CollaboratorNotFoundException()
    }

    return {
      collaborator
    };
  }

  async deleteCollaborator(id: number, email: string): Promise<{
    error?: Error
    success?: HttpException
  }> {
    const { id: userId } = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (!userId) return {
      error: new UnauthorizedException('No access')
    }

    const { collaborator } = await this.findCollaboratorById(id);
    if (!collaborator) return {
      error: new CollaboratorNotFoundException()
    }
    if (collaborator.receiverId !== userId || collaborator.senderId !== userId)
      return {
        error: new DeleteCollaboratorException()
      }

    await prisma.collaborators.delete({
      where: {
        id,
      },
    });

    return {
      success: new HttpException('Deleted', HttpStatus.OK)
    }
  }

  async isCurrentlyCollaborating(senderId: number, receiverId: number): Promise<Collaborators> {
    const currentlyCollaborating = await prisma.collaborators.findFirst({
      where: {
        OR: [
          {
            senderId,
            receiverId,
          },
          {
            senderId: receiverId,
            receiverId: senderId,
          },
        ],
      },
    });

    return currentlyCollaborating;
  }
}
