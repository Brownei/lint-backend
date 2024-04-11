import { Inject, Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UsersService } from '../users/services/users.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { ConversationNotFoundException } from 'src/utils/exceptions/ConversationNotFoundException';
import { UserNotFoundException } from 'src/utils/exceptions/UserNotFound';
import { CreateConversationException } from 'src/utils/exceptions/CreateConversationException';
import { CollaboratorNotFoundException } from 'src/utils/exceptions/CollaboratorNotFound';
import { ConversationExistsException } from 'src/utils/exceptions/ConversationExistsException';
import { prisma } from 'src/prisma.module';
import { ProfileService } from '../users/services/profile.service';
import { Message } from '@prisma/client';

@Injectable()
export class ConversationsService {
  constructor(
    @Inject(UsersService)
    private readonly userService: UsersService,
    @Inject(CollaboratorsService)
    private readonly collaboratorService: CollaboratorsService,
    @Inject(ProfileService)
    private readonly profileService: ProfileService,
  ) {}

  async getConversations(email: string) {
    const profile = await this.profileService.getProfileThroughUserEmail(email);

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
    });
  }

  async createConversation(
    email: string,
    createConversationpayload: CreateConversationDto,
  ) {
    const creator =
      await this.userService.findOneUserByEmailAndGetSomeData(email);
    const { fullName } = createConversationpayload;
    const recipient = await this.userService.findOneUserByFullName(fullName);

    if (!recipient) throw new UserNotFoundException();
    if (creator.id === recipient.id)
      throw new CreateConversationException(
        'Cannot create Conversation with yourself',
      );
    const isCollaborating =
      await this.collaboratorService.isCurrentlyCollaborating(
        creator.id,
        recipient.id,
      );
    if (!isCollaborating) throw new CollaboratorNotFoundException();
    const exists = await this.isCreated(creator.id, recipient.id);
    if (exists) throw new ConversationExistsException();

    const newConversation = await prisma.conversation.create({
      data: {
        creatorId: creator.id,
        recipientId: recipient.id,
      },
    });

    return newConversation;
  }

  async findById(id: number) {
    return await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: true,
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

  async getMessages(id: number, limit: number) {
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

  async update(id: number, lastMessageSent: Message, userId: number) {
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

  async hasAccess(id: number, userId: number) {
    const conversation = await this.findById(id);
    if (!conversation) throw new ConversationNotFoundException();
    return (
      conversation.creatorId === userId || conversation.recipientId === userId
    );
  }
}
