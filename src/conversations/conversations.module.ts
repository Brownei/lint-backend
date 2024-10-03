import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/services/users.service';
import { CollaboratorsModule } from '../collaborators/collaborators.module';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [UsersModule, CollaboratorsModule, SocketModule],
  controllers: [ConversationsController],
  providers: [ConversationsService, UsersService, CollaboratorsService],
  exports: [ConversationsService],
})
export class ConversationsModule { }
