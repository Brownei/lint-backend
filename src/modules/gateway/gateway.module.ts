import { Module } from '@nestjs/common';
import { MessagingGateway } from './gateway';
import { GatewaySessionManager } from './gateway.session';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [
    MessagingGateway,
    {
      provide: GatewaySessionManager,
      useClass: GatewaySessionManager,
    },
  ],
  exports: [
    MessagingGateway,
    {
      provide: GatewaySessionManager,
      useClass: GatewaySessionManager,
    },
  ],
})
export class GatewayModule {}
