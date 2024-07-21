import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConversationsService } from '../conversations/conversations.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { ConversationNotFoundException } from '../conversations/exceptions/ConversationNotFoundException';
import { CollaboratorNotFoundException } from '../collaborators/exceptions/CollaboratorNotFound';
import { UsersService } from '../users/services/users.service';
import { MessageException } from './exceptions/MessageException';
import { prisma } from '../prisma.module';
import { Conversation, Message } from '@prisma/client';
import { SuccessSentException } from '../exceptions/SuccessExceptions';
import { pusher } from 'src/pusher.module';

@Injectable()
export class MessagesService {
  constructor(
    @Inject(ConversationsService)
    private readonly conversationService: ConversationsService,
    @Inject(UsersService)
    private readonly usersService: UsersService,
    @Inject(CollaboratorsService)
    private readonly collaboratorsService: CollaboratorsService,
  ) { }

  async createMessage(
    createMessageDto: CreateMessageDto,
    userId: number,
    conversationId: string,
  ): Promise<{
    error?: Error
    success?: HttpException
  }> {
    const conversation =
      await this.conversationService.findById(conversationId);

    const { user } = await this.usersService.findOneUserById(userId);

    if (!conversation) return {
      error: new ConversationNotFoundException()
    }
    const { creatorId, recipientId } = conversation;

    const isCurrentlyCollaborating =
      await this.collaboratorsService.isCurrentlyCollaborating(
        creatorId,
        recipientId,
      );

    if (!isCurrentlyCollaborating) return {
      error: new CollaboratorNotFoundException()
    }
    if (creatorId !== userId && recipientId !== userId)
      return {
        error: new MessageException('Cannot Create Message')
      }

    const newMessage = await prisma.message.create({
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
        conversationId,
      },
    });

    pusher.trigger('collaborator-request', 'reject', {
      message: JSON.stringify(newMessage),
    });

    return {
      success: new SuccessSentException()
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
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
    conversationId: string,
    messageId: string,
  ) {
    const conversation = await this.conversationService.getMessages(
      conversationId,
      5,
    );
    if (!conversation) return new ConversationNotFoundException();
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
    if (!message) return new MessageException('Cannot Delete Message');
    if (
      conversation.messages.some((lastMessage) => lastMessage.id !== message.id)
    ) {
      return await prisma.message.delete({
        where: {
          id: message.id,
        },
      });
    }

    return this.deleteLastMessage(conversation, message, userId);
  }

  async deleteLastMessage(
    conversation: Conversation,
    message: Message,
    userId: number,
  ): Promise<{
    error?: Error
    success?: HttpException
  }> {
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
      return {
        success: new HttpException('Deleted', HttpStatus.ACCEPTED)
      }
    } else {
      console.log('There are more than 1 message');
      const newLastMessage = conversationCreated.messages[SECOND_MESSAGE_INDEX];
      await this.conversationService.update(
        conversation.id,
        newLastMessage,
        userId,
      );
      await prisma.message.delete({
        where: { id: message.id },
      });
      return {
        success: new HttpException('Deleted', HttpStatus.ACCEPTED)

      }
    }
  }

  async editMessage(
    conversationId: string,
    messageId: string,
    userId: number,
    content: string,
  ): Promise<{
    error?: Error
    success?: HttpException
  }> {
    const messageDB = await prisma.message.findFirst({
      where: {
        id: messageId,
        creator: {
          id: userId,
        },
      },
    });
    if (!messageDB)
      return {
        error: new HttpException('Cannot Edit Message', HttpStatus.BAD_REQUEST)
      }

    await prisma.message.update({
      where: {
        id: messageId,
        conversationId,
      },
      data: {
        content,
      },
    });

    return {
      success: new HttpException('Edited', HttpStatus.OK)
    }
  }
}
