import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CollaboratorNotFoundException } from './exceptions/CollaboratorNotFound';
import { NotCollaboratingException } from './exceptions/NotCollaborating';
import { DeleteCollaboratorException } from './exceptions/DeleteCollaborator';
import { prisma } from '../prisma.module';
import { pusher } from '../pusher.module';

@Injectable()
export class CollaboratorsService {
  constructor() { }

  async createCollaborators(senderId: number, receiverId: number) {
    const activelyCollaborating = this.isCurrentlyCollaborating(
      senderId,
      receiverId,
    );

    if (activelyCollaborating)
      throw new ConflictException('You guys are currently collaborating');

    const collaborators = await prisma.collaborators.create({
      data: {
        receiverId,
        senderId,
      },
    });

    pusher.trigger('collaborators', 'new-collaborator', {
      message: JSON.stringify(collaborators),
    });

    return new HttpException('Created', HttpStatus.CREATED);
  }

  async getAllCollaborators(email: string) {
    const { id } = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (!id) throw new UnauthorizedException('No access');

    return await prisma.collaborators.findMany({
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
            username: true,
            profileImage: true,
          },
        },
        sender: {
          select: {
            username: true,
            profileImage: true,
          },
        },
      },
    });
  }

  async findCollaboratorById(id: number) {
    const collaborator = await prisma.collaborators.findUnique({
      where: {
        id,
      },
    });

    if (!collaborator) throw new CollaboratorNotFoundException();

    return collaborator;
  }

  async deleteCollaborator(id: number, email: string) {
    const { id: userId } = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (!userId) throw new UnauthorizedException('No access');

    const collaborator = await this.findCollaboratorById(id);
    if (!collaborator) throw new CollaboratorNotFoundException();
    if (collaborator.receiverId !== userId || collaborator.senderId !== userId)
      throw new DeleteCollaboratorException();

    await prisma.collaborators.delete({
      where: {
        id,
      },
    });

    return new HttpException('Deleted', HttpStatus.OK);
  }

  async isCurrentlyCollaborating(senderId: number, receiverId: number) {
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

    if (!currentlyCollaborating) throw new NotCollaboratingException();

    return currentlyCollaborating;
  }
}
