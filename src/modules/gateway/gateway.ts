import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Inject, Logger } from '@nestjs/common';
import { GatewaySessionManager } from './gateway.session';
import { AuthenticatedSocket } from 'src/utils/types/types';
import { CurrentUser } from 'src/guard/auth.guard';
import { UsersService } from '../users/services/users.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  },
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(GatewaySessionManager)
    private readonly sessions: GatewaySessionManager,
    @Inject(UsersService)
    private readonly userService: UsersService,
  ) {}

  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');

  async handleConnection(
    socket: AuthenticatedSocket,
    @CurrentUser('id') id: number,
  ) {
    this.logger.log('Incoming Connection');
    const currentUser = await this.userService.findOneUserById(id);
    this.sessions.setUserSocket(socket.user.id, socket);
    socket.emit('connected', {});
    this.logger.log(`${currentUser.fullName} has connected with ${socket.id}.`);
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    this.logger.log('handleDisconnect');
    this.sessions.removeUserSocket(Number(socket.user.id));
    this.logger.log(`${socket.user.id} disconnected.`);
  }

  @SubscribeMessage('onRequestSent')
  notify(@MessageBody() data: any): void {
    this.server.emit('onRequestSent', data);
  }
}
