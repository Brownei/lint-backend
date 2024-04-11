import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConversationsService } from '../conversations/conversations.service';
import { MessageAttachmentsService } from '../message-attachments/message-attachments.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { ConversationNotFoundException } from 'src/utils/exceptions/ConversationNotFoundException';
import { CollaboratorNotFoundException } from 'src/utils/exceptions/CollaboratorNotFound';
import { UsersService } from '../users/services/users.service';
import { MessageException } from 'src/utils/exceptions/MessageException';
import { prisma } from 'src/utils/prisma.module';
import { Conversation, Message } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(
    @Inject(ConversationsService)
    private readonly conversationService: ConversationsService,
    @Inject(UsersService)
    private readonly usersService: UsersService,
    @Inject(MessageAttachmentsService)
    private readonly messageAttachmentsService: MessageAttachmentsService,
    @Inject(CollaboratorsService)
    private readonly collaboratorsService: CollaboratorsService,
  ) {}

  async createMessage(createMessageDto: CreateMessageDto, userId: number) {
    const conversation = await this.conversationService.findById(
      createMessageDto.conservationId,
    );

    const user = await this.usersService.findOneUserById(userId);

    if (!conversation) throw new ConversationNotFoundException();
    const { creatorId, recipientId } = conversation;

    const isCurrentlyCollaborating =
      await this.collaboratorsService.isCurrentlyCollaborating(
        creatorId,
        recipientId,
      );

    if (!isCurrentlyCollaborating) throw new CollaboratorNotFoundException();
    if (creatorId !== userId && recipientId !== userId)
      throw new MessageException('Cannot Create Message');

    const message = await prisma.message.create({
      data: {
        content: createMessageDto.content,
        attachments: {
          createMany: {
            data: createMessageDto.attachments.map((attach) => ({
              attachments: attach,
            })),
          },
        },
        creatorId: user.id,
        conversationId: createMessageDto.conservationId,
      },
    });

    return message;
  }

  async getMessages(conversationId: number) {
    return await prisma.message.findMany({
      where: {
        conversation: {
          id: conversationId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteMessage(
    userId: number,
    conversationId: number,
    messageId: number,
  ) {
    const conversation = await this.conversationService.getMessages(
      conversationId,
      5,
    );
    if (!conversation) throw new ConversationNotFoundException();
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversation: {
          id: conversationId,
        },
        creator: {
          id: userId,
        },
      },
    });
    if (!message) throw new MessageException('Cannot Delete Message');
    if (
      conversation.messages.some((lastMessage) => lastMessage.id !== message.id)
    )
      return await prisma.message.delete({
        where: {
          id: message.id,
        },
      });

    return this.deleteLastMessage(conversation, message, userId);
  }

  async deleteLastMessage(
    conversation: Conversation,
    message: Message,
    userId: number,
  ) {
    const conversationCreated = await prisma.conversation.findUnique({
      where: {
        id: conversation.id,
      },
      include: {
        messages: true,
      },
    });

    const size = conversationCreated.messages.length;

    const SECOND_MESSAGE_INDEX = 1;
    if (size <= 1) {
      console.log('Last Message Sent is deleted');
      await this.conversationService.update(conversation.id, null, userId);
      return await prisma.message.delete({
        where: { id: message.id },
      });
    } else {
      console.log('There are more than 1 message');
      const newLastMessage = conversationCreated.messages[SECOND_MESSAGE_INDEX];
      await this.conversationService.update(
        conversation.id,
        newLastMessage,
        userId,
      );

      return await prisma.message.delete({
        where: { id: message.id },
      });
    }
  }

  async editMessage(
    conversationId: number,
    messageId: number,
    userId: number,
    content: string,
  ) {
    const messageDB = await prisma.message.findFirst({
      where: {
        id: messageId,
        creator: {
          id: userId,
        },
      },
    });
    if (!messageDB)
      throw new HttpException('Cannot Edit Message', HttpStatus.BAD_REQUEST);

    await prisma.message.update({
      where: {
        id: messageId,
        conversationId,
      },
      data: {
        content,
      },
    });

    return new HttpException('Edited', HttpStatus.OK);
  }
}
