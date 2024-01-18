import { Module } from '@nestjs/common';
import { MessagingGateway } from './gateway.gateway';
import { GatewaySessionManager } from './gateway,.session';
import { ConversationsModule } from '../conversations/conversations.module';
import { CollaboratorsModule } from '../collaborators/collaborators.module';

@Module({
  imports: [ConversationsModule, CollaboratorsModule],
  providers: [MessagingGateway, GatewaySessionManager],
  exports: [MessagingGateway],
})
export class GatewayModule {}
