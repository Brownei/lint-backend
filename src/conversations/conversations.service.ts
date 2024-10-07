import { Inject, Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UsersService } from '../users/services/users.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { ConversationNotFoundException } from './exceptions/ConversationNotFoundException';
import { UserNotFoundException } from '../users/exceptions/UserNotFound';
import { CreateConversationException } from './exceptions/CreateConversationException';
import { CollaboratorNotFoundException } from 'src/collaborators/exceptions/CollaboratorNotFound';
import { ConversationExistsException } from './exceptions/ConversationExistsException';
import { prisma } from '../prisma.module';
import { ProfileService } from '../users/services/profile.service';
import { Conversation, Message } from '@prisma/client';

@Injectable()
export class ConversationsService {
  constructor(
    @Inject(UsersService)
    private readonly userService: UsersService,
    @Inject(CollaboratorsService)
    private readonly collaboratorService: CollaboratorsService,
    @Inject(ProfileService)
    private readonly profileService: ProfileService,
  ) { }

  async getConversations(email: string): Promise<Conversation[]> {
    const { profile } = await this.profileService.getProfileThroughUserEmail(email);

    return await prisma.conversation.findMany({
      where: {
        OR: [
          {
            creatorId: profile.id,
          },
          {
            recipientId: profile.id,
          },
        ],
      },
      include: {
        creator: {
          select: {
            fullName: true,
            profileImage: true,
            occupation: true,
            id: true,
            username: true
          }
        },
        recipient: {
          select: {
            fullName: true,
            occupation: true,
            id: true,
            username: true,
            profileImage: true
          }
        }
      }
    });
  }

  async createConversation(
    id: number,
    createConversationpayload: CreateConversationDto,
  ): Promise<{
    error?: Error
    newConversation?: Conversation
  }> {
    const { profile: creator } =
      await this.profileService.getSomeoneProfileThroughId(id);
    const { receiverId } = createConversationpayload;
    const { profile: recipient } = await this.profileService.getSomeoneProfileThroughId(receiverId);

    if (!recipient) return {
      error: new UserNotFoundException()
    }
    if (creator.id === recipient.id)
      return {
        error: new CreateConversationException(
          'Cannot create Conversation with yourself',
        )
      }
    const isCollaborating =
      await this.collaboratorService.isCurrentlyCollaborating(
        creator.id,
        recipient.id,
      );
    if (!isCollaborating) return {
      error: new CollaboratorNotFoundException()
    }
    const exists = await this.isCreated(creator.id, recipient.id);
    if (exists) return {
      error: new ConversationExistsException()
    }

    const newConversation = await prisma.conversation.create({
      data: {
        creatorId: creator.id,
        recipientId: recipient.id,
      },
    });

    return {
      newConversation
    };
  }

  async findById(id: string) {
    return await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: true,
        creator: true,
        recipient: true,
      },
    });
  }

  async isCreated(userId: number, recipientId: number) {
    return await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            creatorId: userId,
            recipientId,
          },
          {
            creatorId: recipientId,
            recipientId: userId,
          },
        ],
      },
    });
  }

  async getMessages(id: string, limit: number) {
    return await prisma.conversation.findFirst({
      where: {
        id,
      },
      include: {
        messages: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async update(id: string, lastMessageSent: Message, userId: number) {
    return await prisma.conversation.update({
      where: {
        id,
      },
      data: {
        messages: {
          create: {
            content: lastMessageSent.content,
            creatorId: userId,
          },
        },
      },
    });
  }

  async hasAccess(id: string, userId: number) {
    const conversation = await this.findById(id);
    if (!conversation) return new ConversationNotFoundException();
    return (
      conversation.creatorId === userId || conversation.recipientId === userId
    );
  }
}
