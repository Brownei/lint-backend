import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CurrentUser } from '../auth/guard/auth.guard';
import { EmptyMessageException } from './exceptions/EmptyMessageException';
import { EditMessageDto } from './dto/edit-message.dto';
import { FirebaseAuthGuard } from 'src/auth/guard/firebase.guard';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }

  @Post(':id')
  @UseGuards(FirebaseAuthGuard)
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser('email') email: string,
    @Param('id', ParseUUIDPipe) conversationId: string,
  ) {
    const { content, attachments } = createMessageDto;
    if (!attachments && !content) return new EmptyMessageException();

    return await this.messagesService.createMessage(
      createMessageDto,
      email,
      conversationId,
    );
  }

  @Get(':conversationId')
  @UseGuards(FirebaseAuthGuard)
  async getMessagesFromConversation(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
  ) {
    console.log('Reached messages!')
    console.log(conversationId)
    return await this.messagesService.getMessages(conversationId);
  }

  @Delete(':/conversationId/:messageId')
  @UseGuards(FirebaseAuthGuard)
  async deleteMessageFromConversation(
    @CurrentUser('id') id: number,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
  ) {
    // const params = { userId, conversationId, messageId };
    return this.messagesService.deleteMessage(id, conversationId, messageId);
  }

  // api/conversations/:conversationId/messages/:messageId
  @Patch(':conversationId/:messageId')
  @UseGuards(FirebaseAuthGuard)
  async editMessage(
    @CurrentUser('id') userId: number,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
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
