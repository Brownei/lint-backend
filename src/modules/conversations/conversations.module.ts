import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collaborator, Conversation, Message, User } from 'src/utils/typeorm';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/services/users.service';
import { CollaboratorsModule } from '../collaborators/collaborators.module';
import { CollaboratorsService } from '../collaborators/collaborators.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, User, Collaborator]),
    UsersModule,
    CollaboratorsModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, UsersService, CollaboratorsService],
  exports: [CollaboratorsService],
})
export class ConversationsModule {}
