import { Module } from '@nestjs/common';
import { MessagingGateway } from './gateway.gateway';
import { GatewaySessionManager } from './gateway,.session';
import { ConversationsModule } from '../conversations/conversations.module';
import { CollaboratorsModule } from '../collaborators/collaborators.module';
import { ConversationsService } from '../conversations/conversations.service';

@Module({
  imports: [ConversationsModule, CollaboratorsModule],
  providers: [MessagingGateway, GatewaySessionManager, ConversationsService],
  exports: [MessagingGateway],
})
export class GatewayModule {}
