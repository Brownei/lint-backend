import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { CollaboratorsModule } from '../collaborators/collaborators.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { MessageAttachmentsModule } from '../message-attachments/message-attachments.module';

@Module({
  imports: [CollaboratorsModule, ConversationsModule, MessageAttachmentsModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
