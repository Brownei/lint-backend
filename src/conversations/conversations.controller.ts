import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CurrentUser } from '../auth/guard/auth.guard';
import { FirebaseAuthGuard } from 'src/auth/guard/firebase.guard';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
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
  @UseGuards(FirebaseAuthGuard)
  async getConversations(@CurrentUser('email') email: string) {
    return this.conversationsService.getConversations(email);
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  async getConversationById(@Param('id') id: string) {
    return this.conversationsService.findById(id);
  }
}
