import { Inject, Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/services/users.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { Repository } from 'typeorm';
import { Conversation, Message } from 'src/utils/typeorm';
import { ConversationNotFoundException } from 'src/utils/exceptions/ConversationNotFoundException';
import { UserNotFoundException } from 'src/utils/exceptions/UserNotFound';
import { CreateConversationException } from 'src/utils/exceptions/CreateConversationException';
import { CollaboratorNotFoundException } from 'src/utils/exceptions/CollaboratorNotFound';
import { ConversationExistsException } from 'src/utils/exceptions/ConversationExistsException';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @Inject(UsersService)
    private readonly userService: UsersService,
    @Inject(CollaboratorsService)
    private readonly collaboratorService: CollaboratorsService,
  ) {}

  async getConversations(id: number) {
    return await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('conversation.creator', 'creator')
      .leftJoinAndSelect('conversation.recipient', 'recipient')
      .leftJoinAndSelect('creator.profile', 'creatorProfile')
      .leftJoinAndSelect('recipient.profile', 'recipientProfile')
      .where('creator.id = :id', { id })
      .orWhere('recipient.id = :id', { id })
      .orderBy('conversation.lastMessageSentAt', 'DESC')
      .getMany();
  }

  async createConversation(
    userId: number,
    createConversationpayload: CreateConversationDto,
  ) {
    const creator = await this.userService.findOneUserById(userId);
    const { firstName, message: content } = createConversationpayload;
    const recipient = await this.userService.findOneUserByFirstName(firstName);
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

    const newConversation = this.conversationRepository.create({
      creator,
      recipient,
    });

    const conversation =
      await this.conversationRepository.save(newConversation);
    const newMessage = this.messageRepository.create({
      content,
      conversation,
      author: creator,
    });

    await this.messageRepository.save(newMessage);
    return conversation;
  }

  async findById(id: number) {
    return await this.conversationRepository.findOne({
      where: { id },
      relations: [
        'creator',
        'recipient',
        'creator.profile',
        'recipient.profile',
        'lastMessageSent',
      ],
    });
  }

  async isCreated(userId: number, recipientId: number) {
    return this.conversationRepository.findOne({
      where: [
        {
          creator: { id: userId },
          recipient: { id: recipientId },
        },
        {
          creator: { id: recipientId },
          recipient: { id: userId },
        },
      ],
    });
  }

  async getMessages(id: number, limit: number) {
    return await this.conversationRepository
      .createQueryBuilder('conversation')
      .where('id = :id', { id })
      .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('conversation.messages', 'message')
      .where('conversation.id = :id', { id })
      .orderBy('message.createdAt', 'DESC')
      .limit(limit)
      .getOne();
  }

  async update(id: number, lastMessageSent: Message) {
    return await this.conversationRepository.update(id, { lastMessageSent });
  }

  async save(conversation: Conversation) {
    return await this.conversationRepository.save(conversation);
  }

  async hasAccess(id: number, userId: number) {
    const conversation = await this.findById(id);
    if (!conversation) throw new ConversationNotFoundException();
    return (
      conversation.creator.id === userId || conversation.recipient.id === userId
    );
  }
}
