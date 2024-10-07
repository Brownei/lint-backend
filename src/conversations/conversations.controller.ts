import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CurrentUser } from '../auth/guard/auth.guard';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) { }

  @Post()
  async createConversation(
    @CurrentUser('id') id: number,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    return await this.conversationsService.createConversation(
      id,
      createConversationDto,
    );
  }

  @Get()
  async getConversations(@CurrentUser('email') email: string) {
    console.log('Reached!')
    return await this.conversationsService.getConversations(email);
  }

  @Get(':id')
  async getConversationById(@Param('id') id: string) {
    return await this.conversationsService.findById(id);
  }
}
