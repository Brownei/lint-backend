import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
// import { UpdateMessageDto } from './dto/update-message.dto';
import { Conversation, Message } from 'src/utils/typeorm';
import { ConversationsService } from '../conversations/conversations.service';
import { MessageAttachmentsService } from '../message-attachments/message-attachments.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationNotFoundException } from 'src/utils/exceptions/ConversationNotFoundException';
import { CollaboratorNotFoundException } from 'src/utils/exceptions/CollaboratorNotFound';
import { instanceToPlain } from 'class-transformer';
import { UsersService } from '../users/services/users.service';
import { MessageException } from 'src/utils/exceptions/MessageException';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
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
    const { creator, recipient } = conversation;
    const isCurrentlyCollaborating =
      await this.collaboratorsService.isCurrentlyCollaborating(
        creator.id,
        recipient.id,
      );
    if (!isCurrentlyCollaborating) throw new CollaboratorNotFoundException();
    if (creator.id !== userId && recipient.id !== userId)
      throw new MessageException('Cannot Create Message');
    const message = this.messageRepository.create({
      content: createMessageDto.content,
      conversation,
      author: instanceToPlain(user),
      attachments: createMessageDto.attachments
        ? await this.messageAttachmentsService.create(
            createMessageDto.attachments,
          )
        : [],
    });
    const savedMessage = await this.messageRepository.save(message);
    conversation.lastMessageSent = savedMessage;
    const updated = await this.conversationService.save(conversation);
    return { message: savedMessage, conversation: updated };
  }

  async getMessages(conversationId: number) {
    return await this.messageRepository.find({
      relations: ['author', 'attachments', 'author.profile'],
      where: { conversation: { id: conversationId } },
      order: { createdAt: 'DESC' },
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
    const message = await this.messageRepository.findOne({
      where: {
        id: messageId,
        conversation: {
          id: conversationId,
        },
        author: {
          id: userId,
        },
      },
    });
    if (!message) throw new MessageException('Cannot Delete Message');
    if (conversation.lastMessageSent.id !== message.id)
      return this.messageRepository.delete({ id: message.id });
    return this.deleteLastMessage(conversation, message);
  }

  async deleteLastMessage(conversation: Conversation, message: Message) {
    const size = conversation.messages.length;
    const SECOND_MESSAGE_INDEX = 1;
    if (size <= 1) {
      console.log('Last Message Sent is deleted');
      await this.conversationService.update(conversation.id, null);
      return await this.messageRepository.delete({ id: message.id });
    } else {
      console.log('There are more than 1 message');
      const newLastMessage = conversation.messages[SECOND_MESSAGE_INDEX];
      await this.conversationService.update(conversation.id, newLastMessage);

      return await this.messageRepository.delete({ id: message.id });
    }
  }

  async editMessage(
    conversationId: number,
    messageId: number,
    userId: number,
    content: string,
  ) {
    const messageDB = await this.messageRepository.findOne({
      where: {
        id: messageId,
        author: { id: userId },
      },
      relations: [
        'conversation',
        'conversation.creator',
        'conversation.recipient',
        'author',
        'author.profile',
      ],
    });
    if (!messageDB)
      throw new HttpException('Cannot Edit Message', HttpStatus.BAD_REQUEST);
    messageDB.content = content;
    return await this.messageRepository.save(messageDB);
  }
}
