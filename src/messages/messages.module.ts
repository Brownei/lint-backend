import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { CollaboratorsModule } from '../collaborators/collaborators.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { UsersModule } from 'src/users/users.module';
import { MessageAttachmentsService } from 'src/message-attachments/message-attachments.service';
import { MessageAttachmentsModule } from 'src/message-attachments/message-attachments.module';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [CollaboratorsModule, ConversationsModule, UsersModule, MessageAttachmentsModule, SocketModule],
  controllers: [MessagesController],
  providers: [MessagesService, MessageAttachmentsService],
  exports: [MessagesService]
})
export class MessagesModule { }
