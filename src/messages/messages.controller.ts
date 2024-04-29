import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser } from '../auth/guard/auth.guard';
import { EmptyMessageException } from './exceptions/EmptyMessageException';
import { EditMessageDto } from './dto/edit-message.dto';
import { ApiTags } from '@nestjs/swagger';
import { pusher } from '../pusher.module';

@ApiTags('conversations/:id/messages')
@Controller('conversations/:id/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async createMessage(
    @CurrentUser('id') userId: number,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const { content, attachments } = createMessageDto;
    if (!attachments || !content) throw new EmptyMessageException();

    pusher.trigger(
      String(conversationId),
      'incoming-message',
      createMessageDto,
    );

    await this.messagesService.createMessage(
      createMessageDto,
      userId,
      conversationId,
    );
  }

  @Get()
  async getMessagesFromConversation(
    @CurrentUser('id') userId: number,
    @Param('id', ParseUUIDPipe) conversationId: string,
  ) {
    const messages = await this.messagesService.getMessages(conversationId);
    return { conversationId, messages };
  }

  @Delete(':messageId')
  async deleteMessageFromConversation(
    @CurrentUser('id') userId: number,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
  ) {
    // const params = { userId, conversationId, messageId };
    await this.messagesService.deleteMessage(userId, conversationId, messageId);
    return { conversationId, messageId };
  }

  // api/conversations/:conversationId/messages/:messageId
  @Patch(':messageId')
  async editMessage(
    @CurrentUser('id') userId: number,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() { content }: EditMessageDto,
  ) {
    const message = await this.messagesService.editMessage(
      conversationId,
      messageId,
      userId,
      content,
    );
    return message;
  }
}
