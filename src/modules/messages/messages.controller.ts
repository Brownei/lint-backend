import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser } from 'src/guard/auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmptyMessageException } from 'src/utils/exceptions/EmptyMessageException';
import { Routes } from 'src/utils/constants';
import { EditMessageDto } from './dto/edit-message.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags(Routes.MESSAGES)
@Controller(Routes.MESSAGES)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async createMessage(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const { content, attachments } = createMessageDto;
    if (!attachments || !content) throw new EmptyMessageException();
    const response = await this.messagesService.createMessage(
      createMessageDto,
      userId,
    );
    return response;
  }

  @Get()
  async getMessagesFromConversation(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const messages = await this.messagesService.getMessages(id);
    return { id, messages };
  }

  @Delete(':messageId')
  async deleteMessageFromConversation(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) conversationId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    const params = { userId, conversationId, messageId };
    await this.messagesService.deleteMessage(userId, conversationId, messageId);
    this.eventEmitter.emit('message.delete', params);
    return { conversationId, messageId };
  }
  // api/conversations/:conversationId/messages/:messageId
  @Patch(':messageId')
  async editMessage(
    @CurrentUser('id') userId: number,
    @Param('id') conversationId: number,
    @Param('messageId') messageId: number,
    @Body() { content }: EditMessageDto,
  ) {
    const message = await this.messagesService.editMessage(
      conversationId,
      messageId,
      userId,
      content,
    );
    this.eventEmitter.emit('message.update', message);
    return message;
  }
}
