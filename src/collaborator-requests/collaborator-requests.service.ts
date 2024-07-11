import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/services/users.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { CollaboratorAlreadyExists } from '../collaborators/exceptions/CollaboratorAlreadyExists';
import { CollaboratorException } from '../collaborators/exceptions/CollaboratorException';
import {
  SuccessAcceptedException,
  SuccessException,
  SuccessRejectedException,
} from '../exceptions/SuccessExceptions';
import { CollaboratorNotFoundException } from '../collaborators/exceptions/CollaboratorNotFound';
import { UpdateCollaboratorRequestDto } from './dto/update-collaboration-requests.dto';
import { prisma } from '../prisma.module';
import { pusher } from 'src/pusher.module';
import { ProfileService } from 'src/users/services/profile.service';

@Injectable()
export class CollaboratorRequestService {
  constructor(
    @Inject(UsersService)
    private readonly userService: UsersService,
    @Inject(CollaboratorsService)
    private readonly collaboratorService: CollaboratorsService,
    @Inject(ProfileService)
    private readonly profileService: ProfileService,
  ) { }

  async isPending(userId: number, postId: string, receiverId: number) {
    return await prisma.collaboratorRequest.findFirst({
      where: {
        postId,
        receiverId,
        senderId: userId,
        status: 'pending',
      },
    });
  }

  async findSentRequestById(id: string, email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    const request = await prisma.collaboratorRequest.findFirst({
      where: {
        id,
        senderId: user.id
      },
      select: {
        id: true,
        status: true,
        post: true,
        receiver: true,
        sender: true,
      },
    });

    if (!request) throw new CollaboratorException('Request not found');

    return request;
  }

  async findById(id: string) {
    return await prisma.collaboratorRequest.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        status: true,
        post: true,
        receiver: true,
        sender: true,
      },
    });

  }

  async findReceivedRequestById(id: string, email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    const request = await prisma.collaboratorRequest.findFirst({
      where: {
        id,
        receiverId: user.id
      },
      select: {
        id: true,
        status: true,
        post: true,
        receiver: true,
        sender: true,
      },
    });

    if (!request) throw new CollaboratorException('Request not found');

    return request;

  }

  async getCollaboratorRequestsSent(email: string) {
    const status = 'pending';
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    const requestSent = await prisma.collaboratorRequest.findMany({
      where: {
        sender: {
          userId: user.id,
        },
        status,
      },
    });

    return requestSent;
  }

  async getCollaboratorRequestsReceived(email: string) {
    const status = 'pending';
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    const requestReceived = await prisma.collaboratorRequest.findMany({
      where: {
        receiver: {
          userId: user.id,
        },
        status,
      },
      select: {
        post: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        },
        sender: {
          select: {
            occupation: true,
            fullName: true,
            username: true,
            profileImage: true,
          },
        },
        content: true,
        id: true,
        createdAt: true,
      },
    });

    return requestReceived;
  }

  async create(
    senderId: number,
    receiverId: number,
    postId: string,
    content: string,
  ) {
    try {
      const sender =
        await this.profileService.getSomeoneProfileThroughId(senderId);
      const receiver =
        await this.profileService.getSomeoneProfileThroughId(receiverId);
      const curentlyPending = await this.isPending(
        senderId,
        postId,
        receiverId,
      );

      if (!receiver || !sender) {
        throw new CollaboratorException('Nothing like this here!');
      }

      if (curentlyPending)
        throw new CollaboratorException('Collaborator Requesting Pending');

      if (receiverId === senderId)
        throw new CollaboratorException('Cannot Collaborate With Yourself');

      const areCollaborators = await prisma.collaboratorRequest.findFirst({
        where: {
          OR: [
            {
              senderId,
              receiverId,
              postId,
            },
            {
              senderId: receiverId,
              receiverId: senderId,
              postId,
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
          content: content,
          status: 'pending',
        },
        select: {
          post: {
            select: {
              id: true,
              title: true,
              createdAt: true,
            },
          },
          sender: {
            select: {
              occupation: true,
              fullName: true,
              username: true,
              profileImage: true,
            },
          },
          content: true,
          id: true,
          createdAt: true,
        },
      });

      await pusher.trigger(
        String(receiverId),
        'incoming_collaborator_requests',
        collaboratorRequest,
      );

      return collaboratorRequest;
    } catch (error) {
      console.log(error);
      throw new ConflictException();
    }
  }

  async accept(DTO: UpdateCollaboratorRequestDto, id: string, userId: number) {
    const collaboratorRequest = await this.findById(id);
    const sender = await this.userService.findOneUserById(DTO.senderId);
    const currentUser =
      await this.profileService.getSomeoneProfileThroughId(userId);

    if (!sender || !currentUser) throw new UnauthorizedException();

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
      await Promise.all([
        pusher.trigger(
          collaboratorRequest.id,
          'incoming_collaborator_requests',
          acceptedRequest,
        ),
        this.collaboratorService.createCollaborators(sender.id, userId),
      ]);

      return new SuccessAcceptedException();
    }
  }

  async reject(id: string, userId: number) {
    const collaboratorRequest = await this.findById(id);
    if (!collaboratorRequest) throw new CollaboratorNotFoundException();
    if (collaboratorRequest.status === 'accepted')
      throw new CollaboratorException('Collaborator Request Already Accepted');
    if (collaboratorRequest.receiver.id !== userId)
      throw new CollaboratorException('You cannot reject your own request');

    const rejectedRequest = await prisma.collaboratorRequest.update({
      where: {
        id: collaboratorRequest.id,
      },
      data: {
        status: 'rejected',
      },
    });

    pusher.trigger('collaborator-request', 'reject', {
      message: JSON.stringify(rejectedRequest),
    });

    throw new SuccessRejectedException();
  }

  async cancel(id: string, userId: number) {
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
