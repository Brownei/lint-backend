import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { CollaboratorsModule } from '../collaborators/collaborators.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [CollaboratorsModule, ConversationsModule, UsersModule],
  controllers: [MessagesController],
  providers: [MessagesService,],
  exports: [MessagesService]
})
export class MessagesModule { }
