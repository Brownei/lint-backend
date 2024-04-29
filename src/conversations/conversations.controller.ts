import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CurrentUser } from '../auth/guard/auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('conversations')
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  async createConversation(
    @CurrentUser('email') email: string,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    return await this.conversationsService.createConversation(
      email,
      createConversationDto,
    );
  }

  @Get()
  async getConversations(@CurrentUser('email') email: string) {
    return this.conversationsService.getConversations(email);
  }

  @Get(':id')
  async getConversationById(@Param('id') id: string) {
    return this.conversationsService.findById(id);
  }
}
