import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConversationsService } from '../conversations/conversations.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { ConversationNotFoundException } from '../conversations/exceptions/ConversationNotFoundException';
import { CollaboratorNotFoundException } from '../collaborators/exceptions/CollaboratorNotFound';
import { UsersService } from '../users/services/users.service';
import { MessageException } from './exceptions/MessageException';
import { prisma } from '../prisma.module';
import { Conversation, Message, Profile } from '@prisma/client';
import { SuccessSentException } from '../exceptions/SuccessExceptions';
import { MessageAttachmentsService } from 'src/message-attachments/message-attachments.service';
import { ProfileService } from 'src/users/services/profile.service';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class MessagesService {
  constructor(
    @Inject(ConversationsService)
    private readonly conversationService: ConversationsService,
    @Inject(UsersService)
    private readonly usersService: UsersService,
    @Inject(ProfileService)
    private readonly profileService: ProfileService,
    private readonly socketGateway: SocketGateway,
    @Inject(CollaboratorsService)
    private readonly collaboratorsService: CollaboratorsService,
    @Inject(MessageAttachmentsService)
    private readonly messageAttachmentsService: MessageAttachmentsService
  ) { }

  async createMessage(
    createMessageDto: CreateMessageDto,
    email: string,
    conversationId: string,
  ): Promise<{
    error?: Error
    messages?: Message
  }> {
    const conversation =
      await this.conversationService.findById(conversationId);

    const { profile } = await this.profileService.getProfileThroughUserEmail(email);

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
    if (creatorId !== profile.id && recipientId !== profile.id)
      return {
        error: new MessageException('Cannot Create Message')
      }

    const newMessage = await prisma.message.create({
      data: {
        content: createMessageDto.content,
        creatorId: profile.id,
        conversationId,
      },
      include: {
        conversation: {
          select: {
            recipient: true,
            creator: true
          }
        }
      }
    });

    if (createMessageDto.attachments) {
      await this.messageAttachmentsService.create(createMessageDto.attachments, newMessage.id)
    };

    await this.socketGateway.globalWebSocketFunction({
      conversationId,
      message: JSON.stringify(newMessage)
    }, 'new-message')

    return {
      messages: newMessage
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return await prisma.message.findMany({
      where: {
        conversation: {
          id: conversationId,
        },
      },
      include: {
        conversation: {
          select: {
            recipient: true,
            creator: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc',
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
