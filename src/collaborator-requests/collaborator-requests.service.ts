import {
  ConflictException,
  HttpException,
  HttpStatus,
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
import { CollaboratorRequest } from '@prisma/client';
import { CollaboratorsRequestDetails, CollaboratorsRequestReturns } from 'src/utils/types/types';
import { UserNotFoundException } from 'src/users/exceptions/UserNotFound';
import { MessagesService } from 'src/messages/messages.service';
import { ConversationsService } from 'src/conversations/conversations.service';

@Injectable()
export class CollaboratorRequestService {
  constructor(
    @Inject(UsersService)
    private readonly userService: UsersService,
    @Inject(CollaboratorsService)
    private readonly collaboratorService: CollaboratorsService,
    @Inject(ProfileService)
    private readonly profileService: ProfileService,
    @Inject(MessagesService)
    private readonly messageService: MessagesService,
    @Inject(ConversationsService)
    private readonly conversationService: ConversationsService,

  ) { }

  async isPending(userId: number, postId: string, receiverId: number): Promise<CollaboratorRequest> {
    return await prisma.collaboratorRequest.findFirst({
      where: {
        postId,
        receiverId,
        senderId: userId,
        status: 'pending',
      },
    });
  }

  async findSentRequestById(id: string, email: string): Promise<{
    error?: Error
    request?: CollaboratorsRequestReturns
  }> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) return {
      error: new UserNotFoundException()
    }

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

    if (!request) return {
      error: new CollaboratorException('Request not found')
    }

    return {
      request
    }
  }

  async findById(id: string): Promise<CollaboratorsRequestReturns> {
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

  async findReceivedRequestById(id: string, email: string): Promise<{
    error?: Error
    request?: CollaboratorsRequestReturns
  }> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) return {
      error: new UserNotFoundException()
    }

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

    if (!request) return {
      error: new CollaboratorException('Request not found')
    }

    return {
      request
    };

  }

  async getCollaboratorRequestsSent(email: string): Promise<{
    requestSent?: CollaboratorRequest[]
    error?: Error
  }> {
    const status = 'pending';
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) return {
      error: new UserNotFoundException()
    }

    const requestSent = await prisma.collaboratorRequest.findMany({
      where: {
        sender: {
          userId: user.id,
        },
        status,
      },
    });

    return {
      requestSent
    };
  }

  async getCollaboratorRequestsReceived(email: string): Promise<CollaboratorsRequestDetails[]> {
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
  ): Promise<{
    error?: Error
    success?: HttpException
    collaboratorsRequest?: CollaboratorsRequestDetails
  }> {
    try {
      const { profile: sender } =
        await this.profileService.getSomeoneProfileThroughId(senderId);
      const { profile: receiver } =
        await this.profileService.getSomeoneProfileThroughId(receiverId);
      const curentlyPending = await this.isPending(
        senderId,
        postId,
        receiverId,
      );

      if (!receiver || !sender) {
        return {
          error: new CollaboratorException('Nothing like this here!')
        }
      }

      if (curentlyPending)
        return {
          error: new CollaboratorException('Collaborator Requesting Pending')
        }

      if (receiverId === senderId)
        return {
          error: new CollaboratorException('Cannot Collaborate With Yourself')
        }

      const areCollaborators = await this.collaboratorService.isCurrentlyCollaborating(senderId, receiverId);

      const { user: senderUserDetails } = await this.userService.findOneUserById(sender.userId)


      if (areCollaborators) {
        const alreadyInAConversation = await this.conversationService.isCreated(sender.id, receiver.id)
        if (alreadyInAConversation) {
          await this.messageService.createMessage({
            content: content
          }, sender.id, alreadyInAConversation.id)

          return {
            success: new HttpException('Message sent!', HttpStatus.CREATED)
          }

        };
        const { newConversation } = await this.conversationService.createConversation(senderUserDetails.email, { fullName: receiver.fullName })
        await this.messageService.createMessage({
          content: content
        }, sender.id, newConversation.id)

        return {
          success: new HttpException('Message sent!', HttpStatus.CREATED)
        }
      } else {

        const collaboratorsRequest = await prisma.collaboratorRequest.create({
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
          collaboratorsRequest,
        );

        return {
          collaboratorsRequest
        };

      }
    } catch (error) {
      console.log(error);
      return {
        error: new ConflictException()
      }
    }
  }

  async accept(DTO: UpdateCollaboratorRequestDto, id: string, userId: number): Promise<{
    error?: Error
    success?: HttpException
  }> {
    const collaboratorRequest = await this.findById(id);
    const { user: sender } = await this.userService.findOneUserById(DTO.senderId);
    const currentUser =
      await this.profileService.getSomeoneProfileThroughId(userId);

    if (!sender || !currentUser) return {
      error: new UnauthorizedException()
    }

    if (!collaboratorRequest) return {
      error: new CollaboratorNotFoundException()
    }
    if (collaboratorRequest.status === 'accepted')
      return {
        error: new CollaboratorException('Collaborator Request Already Accepted')
      }
    if (collaboratorRequest.sender?.id === userId)
      return {
        error: new CollaboratorException('You cannot accept your own request')
      }

    const acceptedRequest = await prisma.collaboratorRequest.update({
      where: {
        id: collaboratorRequest.id,
      },
      data: {
        status: 'accepted',
      },
    });

    await this.collaboratorService.createCollaborators(sender.id, userId)

    await pusher.trigger(collaboratorRequest.id, 'incoming_collaborator_requests', acceptedRequest)

    return {
      success: new SuccessAcceptedException()
    }

  }

  async reject(id: string, userId: number): Promise<{
    error?: Error
    success?: HttpException
  }> {
    const collaboratorRequest = await this.findById(id);
    if (!collaboratorRequest) return {
      error: new CollaboratorNotFoundException()
    }
    if (collaboratorRequest.status === 'accepted')
      return {
        error: new CollaboratorException('Collaborator Request Already Accepted')
      }
    if (collaboratorRequest.receiver.id !== userId)
      return {
        error: new CollaboratorException('You cannot reject your own request')
      }

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

    return {
      success: new SuccessRejectedException()
    }
  }

  async cancel(id: string, userId: number): Promise<{
    error?: Error
    success?: HttpException
  }> {
    const collaboratorRequest = await this.findById(id);
    if (!collaboratorRequest) return {
      error: new CollaboratorNotFoundException()
    }
    if (collaboratorRequest.sender.id !== userId)
      return {
        error: new CollaboratorException()
      }
    await prisma.collaboratorRequest.delete({
      where: {
        id,
      },
    });

    return {
      success: new SuccessException('Successfully deleted')
    }
  }
}
