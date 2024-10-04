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
import { CollaboratorException } from '../collaborators/exceptions/CollaboratorException';
import {
  SuccessAcceptedException,
  SuccessException,
  SuccessRejectedException,
} from '../exceptions/SuccessExceptions';
import { CollaboratorNotFoundException } from '../collaborators/exceptions/CollaboratorNotFound';
import { UpdateCollaboratorRequestDto } from './dto/update-collaboration-requests.dto';
import { prisma } from '../prisma.module';
import { ProfileService } from 'src/users/services/profile.service';
import { CollaboratorRequest } from '@prisma/client';
import { CollaboratorsRequestDetails, CollaboratorsRequestReturns } from 'src/utils/types/types';
import { UserNotFoundException } from 'src/users/exceptions/UserNotFound';
import { MessagesService } from 'src/messages/messages.service';
import { ConversationsService } from 'src/conversations/conversations.service';
import { SocketGateway } from 'src/socket/socket.gateway';

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
    private readonly socketGateway: SocketGateway
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
            id: true,
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
    email: string,
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
        await this.profileService.getProfileThroughUserEmail(email);
      const { profile: receiver } =
        await this.profileService.getSomeoneProfileThroughId(receiverId);
      const curentlyPending = await this.isPending(
        sender.id,
        postId,
        receiverId,
      );

      if (!receiver || !sender) {
        return {
          error: new CollaboratorException('Nothing like this here!')
        }
      } else if (curentlyPending) {
        return {
          error: new CollaboratorException('Collaborator Requesting Pending')
        }
      } else if (receiverId === sender.id) {
        return {
          error: new CollaboratorException('Cannot Collaborate With Yourself')
        }
      }

      const areCollaborators = await this.collaboratorService.isCurrentlyCollaborating(sender.id, receiverId);

      const { user: senderUserDetails } = await this.userService.findOneUserById(sender.userId)


      if (areCollaborators) {
        console.log('Got here instead 1')
        const ownerOfPost = receiver.fullName.split(' ')
        const alreadyInAConversation = await this.conversationService.isCreated(sender.id, receiver.id)

        if (alreadyInAConversation) {
          console.log('Got here instead 1.1')
          await this.messageService.createMessage({
            content: content !== '' ? content : `Hello ${ownerOfPost[0]}, I’m interested in working with you.`
          }, senderUserDetails.email, alreadyInAConversation.id)

          await prisma.collaboratorRequest.create({
            data: {
              senderId: sender.id,
              receiverId,
              postId,
              content: content,
              status: 'accepted'
            }
          })

          return {
            success: new HttpException('Message sent!', HttpStatus.CREATED)
          }

        } else {
          const { newConversation } = await this.conversationService.createConversation(senderUserDetails.email, { fullName: receiver.fullName })

          await Promise.all([
            this.messageService.createMessage({
              content: content !== '' ? content : `Hello ${ownerOfPost[0]}, I’m interested in working with you.`
            }, senderUserDetails.email, newConversation.id),

            prisma.collaboratorRequest.create({
              data: {
                senderId: sender.id,
                receiverId,
                postId,
                content: content,
                status: 'accepted'
              }
            })
          ])

          return {
            success: new HttpException('Message sent!', HttpStatus.CREATED)
          }
        }
      } else {
        console.log('Got here instead 2')
        const collaboratorsRequest = await prisma.collaboratorRequest.create({
          data: {
            senderId: sender.id,
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


        await Promise.all([
          this.socketGateway.globalSingleWebSocketFunction({
            userId: String(receiver.id),
            message: JSON.stringify(collaboratorsRequest)
          }, 'new-request'),

          prisma.notification.create({
            data: {
              requestId: collaboratorsRequest.id,
              userId: receiverId
            }
          })
        ])

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

  async accept(DTO: UpdateCollaboratorRequestDto, requestId: string, email: string): Promise<{
    error?: Error
    success?: HttpException
  }> {
    const { user } = await this.userService.findOneUserByEmail(email);

    if (!user) {
      return {
        error: new UnauthorizedException()
      }
    }
    const currentUser =
      await this.profileService.getSomeoneProfileThroughId(user.id);

    const collaboratorRequest = await this.findById(requestId);
    const { profile: sender } = await this.profileService.getSomeoneProfileThroughId(DTO.senderId);

    if (!sender || !currentUser) {
      return {
        error: new UnauthorizedException()
      }
    } else if (!collaboratorRequest) {
      return {
        error: new CollaboratorNotFoundException()
      }
    } else if (collaboratorRequest.status === 'accepted') {
      return {
        error: new CollaboratorException('Collaborator Request Already Accepted')
      }
    }

    if (collaboratorRequest.sender?.id === currentUser.profile.id) {
      return {
        error: new CollaboratorException('You cannot accept your own request')
      }
    }

    const acceptedRequest = await prisma.collaboratorRequest.update({
      where: {
        id: collaboratorRequest.id,
      },
      data: {
        status: 'accepted',
      },
    });

    await this.collaboratorService.createCollaborators(sender.id, currentUser.profile.id)

    await Promise.all([
      this.socketGateway.globalSingleWebSocketFunction({
        userId: String(currentUser.profile.id),
        message: JSON.stringify(acceptedRequest)
      }, 'accepted-request'),

      this.socketGateway.globalSingleWebSocketFunction({
        userId: String(collaboratorRequest.sender.id),
        message: JSON.stringify(acceptedRequest)
      }, 'accepted-request'),

      prisma.notification.create({
        data: {
          requestId: requestId,
          userId: sender.id,
        }
      })
    ])

    return {
      success: new SuccessAcceptedException()
    }

  }

  async reject(requestId: string, email: string): Promise<{
    error?: Error
    success?: HttpException
  }> {
    const { user } = await this.userService.findOneUserByEmail(email);

    const currentUser =
      await this.profileService.getSomeoneProfileThroughId(user.id);

    if (!user) {
      return {
        error: new UnauthorizedException()
      }
    }

    const collaboratorRequest = await this.findById(requestId);
    if (!collaboratorRequest) return {
      error: new CollaboratorNotFoundException()
    }
    if (collaboratorRequest.status === 'accepted') {
      return {
        error: new CollaboratorException('Collaborator Request Already Accepted')
      }
    } else if (collaboratorRequest.sender.id === currentUser.profile.id) {
      return {
        error: new CollaboratorException('You cannot reject your own request')
      }
    }

    const rejectedRequest = await prisma.collaboratorRequest.update({
      where: {
        id: collaboratorRequest.id,
      },
      data: {
        status: 'rejected',
      },
    });

    await Promise.all([
      this.socketGateway.globalSingleWebSocketFunction({
        userId: String(currentUser.profile.id),
        message: JSON.stringify(rejectedRequest)
      }, 'rejected-request'),

      this.socketGateway.globalSingleWebSocketFunction({
        userId: String(collaboratorRequest.sender.id),
        message: JSON.stringify(rejectedRequest)
      }, 'rejected-request'),

      prisma.notification.create({
        data: {
          requestId: collaboratorRequest.id,
          userId: collaboratorRequest.sender.id
        }
      })

    ])

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
