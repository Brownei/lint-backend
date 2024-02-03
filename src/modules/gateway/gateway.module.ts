import { Module } from '@nestjs/common';
import { MessagingGateway } from './gateway';
import { GatewaySessionManager } from './gateway.session';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [MessagingGateway, GatewaySessionManager],
  exports: [MessagingGateway, GatewaySessionManager],
})
export class GatewayModule {}
