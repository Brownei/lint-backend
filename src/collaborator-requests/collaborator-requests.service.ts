import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/services/users.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { CollaboratorAlreadyExists } from 'src/utils/exceptions/CollaboratorAlreadyExists';
import { CollaboratorException } from 'src/utils/exceptions/CollaboratorException';
import {
  SuccessAcceptedException,
  SuccessException,
  SuccessRejectedException,
} from 'src/utils/exceptions/SuccessExceptions';
import { CollaboratorNotFoundException } from 'src/utils/exceptions/CollaboratorNotFound';
import { UpdateCollaboratorRequestDto } from './dto/update-collaboration-requests.dto';
import { prisma } from 'src/prisma.module';

@Injectable()
export class CollaboratorRequestService {
  constructor(
    @Inject(UsersService)
    private readonly userService: UsersService,
    @Inject(CollaboratorsService)
    private readonly collaboratorService: CollaboratorsService,
  ) {}

  async isPending(userId: number, postId: number, receiverId: number) {
    return await prisma.collaboratorRequest.findFirst({
      where: {
        postId,
        receiverId,
        senderId: userId,
        status: 'pending',
      },
    });
  }

  async findById(id: number) {
    return await prisma.collaboratorRequest.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
        post: {
          select: {
            id: true,
            title: true,
          },
        },
        receiver: {
          select: {
            username: true,
            id: true,
          },
        },
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  async getCollaboratorRequestsSent(id: number) {
    const status = 'pending';
    const requestSent = await prisma.collaboratorRequest.findMany({
      where: {
        sender: {
          id,
        },
        status,
      },
    });

    return requestSent;
  }

  async getCollaboratorRequestsReceived(id: number) {
    const status = 'pending';
    const requestReceived = await prisma.collaboratorRequest.findMany({
      where: {
        receiver: {
          id,
        },
        status,
      },
      select: {
        post: {
          select: {
            id: true,
            title: true,
          },
        },
        receiver: {
          select: {
            username: true,
            id: true,
          },
        },
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return requestReceived;
  }

  async create(senderId: number, receiverId: number, postId: number) {
    const sender = await this.userService.findOneUserById(senderId);
    const receiver = await this.userService.findOneUserById(receiverId);

    const curentlyPending = await this.isPending(
      sender.id,
      postId,
      receiver.id,
    );

    if (curentlyPending)
      throw new CollaboratorException('Collaborator Requesting Pending');

    if (receiverId === senderId)
      throw new CollaboratorException('Cannot Collaborate With Yourself');

    if (!sender || !receiver) throw new UnauthorizedException();

    const areCollaborators = await prisma.collaboratorRequest.findFirst({
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

    if (areCollaborators) throw new CollaboratorAlreadyExists();
    const collaboratorRequest = await prisma.collaboratorRequest.create({
      data: {
        senderId,
        receiverId,
        postId,
        status: 'pending',
      },
    });

    return collaboratorRequest;
  }

  async accept(DTO: UpdateCollaboratorRequestDto, userId: number) {
    const collaboratorRequest = await this.findById(DTO.requestId);
    const sender = await this.userService.findOneUserById(DTO.receiverId);
    const receiver = await this.userService.findOneUserById(userId);

    if (!sender || !receiver) throw new UnauthorizedException();

    if (!collaboratorRequest) throw new CollaboratorNotFoundException();
    if (collaboratorRequest.status === 'accepted')
      throw new CollaboratorException('Collaborator Request Already Accepted');
    if (collaboratorRequest.sender?.id === userId)
      throw new CollaboratorException('You cannot accept your own request');

    const acceptedRequest = await prisma.collaboratorRequest.update({
      where: {
        id: collaboratorRequest.id,
      },
      data: {
        status: 'accepted',
      },
    });

    if (!acceptedRequest || acceptedRequest.status !== 'accepted') {
      throw new UnauthorizedException();
    } else {
      await this.collaboratorService.createCollaborators(
        sender.id,
        receiver.id,
      );

      return new SuccessAcceptedException();
    }
  }

  async reject(id: number, userId: number) {
    const collaboratorRequest = await this.findById(id);
    if (!collaboratorRequest) throw new CollaboratorNotFoundException();
    if (collaboratorRequest.status === 'accepted')
      throw new CollaboratorException('Collaborator Request Already Accepted');
    if (collaboratorRequest.receiver.id !== userId)
      throw new CollaboratorException('You cannot reject your own request');

    await prisma.collaboratorRequest.update({
      where: {
        id: collaboratorRequest.id,
      },
      data: {
        status: 'rejected',
      },
    });

    throw new SuccessRejectedException();
  }

  async cancel(id: number, userId: number) {
    const collaboratorRequest = await this.findById(id);
    if (!collaboratorRequest) throw new CollaboratorNotFoundException();
    if (collaboratorRequest.sender.id !== userId)
      throw new CollaboratorException();
    await prisma.collaboratorRequest.delete({
      where: {
        id,
      },
    });

    throw new SuccessException('Successfully deleted');
  }
}
