import { Module } from '@nestjs/common';
import { CollaboratorRequestService } from './collaborator-requests.service';
import { CollaboratorRequestController } from './collaborator-requests.controller';
import { CollaboratorsModule } from '../collaborators/collaborators.module';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/services/users.service';
import { PostsModule } from '../posts/posts.module';
import { MessagesModule } from 'src/messages/messages.module';
import { ConversationsModule } from 'src/conversations/conversations.module';
import { MessagesService } from 'src/messages/messages.service';
import { ConversationsService } from 'src/conversations/conversations.service';

@Module({
  imports: [CollaboratorsModule, UsersModule, PostsModule],
  controllers: [CollaboratorRequestController],
  providers: [CollaboratorRequestService, CollaboratorsService, UsersService, MessagesService, ConversationsService],
  exports: [CollaboratorRequestService],
})
export class CollaboratorRequestModule { }
