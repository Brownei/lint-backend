import { Module } from '@nestjs/common';
import { CollaboratorRequestService } from './collaborator-requests.service';
import { CollaboratorRequestController } from './collaborator-requests.controller';
import { CollaboratorsModule } from '../collaborators/collaborators.module';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/services/users.service';
import { PostsModule } from '../posts/posts.module';
import { MessagesService } from 'src/messages/messages.service';
import { ConversationsService } from 'src/conversations/conversations.service';
import { MessageAttachmentsService } from 'src/message-attachments/message-attachments.service';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [CollaboratorsModule, UsersModule, PostsModule, SocketModule],
  controllers: [CollaboratorRequestController],
  providers: [CollaboratorRequestService, CollaboratorsService, UsersService, MessagesService, ConversationsService, MessageAttachmentsService],
  exports: [CollaboratorRequestService],
})
export class CollaboratorRequestModule { }
