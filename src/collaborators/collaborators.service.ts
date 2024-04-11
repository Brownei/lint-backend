import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CollaboratorNotFoundException } from './exceptions/CollaboratorNotFound';
import { NotCollaboratingException } from './exceptions/NotCollaborating';
import { DeleteCollaboratorException } from './exceptions/DeleteCollaborator';
import { prisma } from 'src/prisma.module';

@Injectable()
export class CollaboratorsService {
  constructor() {}

  async createCollaborators(senderId: number, receiverId: number) {
    const activelyCollaborating = this.isCurrentlyCollaborating(
      senderId,
      receiverId,
    );

    if (activelyCollaborating)
      throw new ConflictException('You guys are currently collaborating');

    await prisma.collaborators.create({
      data: {
        receiverId,
        senderId,
      },
    });

    return new HttpException('Created', HttpStatus.CREATED);
  }

  async getAllCollaborators(id: number) {
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

  async deleteCollaborator(id: number, userId: number) {
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
