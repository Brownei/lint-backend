import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
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
    private readonly userService: UsersService,
  ) {}

  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleConnection(socket: Socket, @CurrentUser('id') id: number) {
    this.logger.log('Incoming Connection');
    // console.log(socket.client.request);
    const currentUser = await this.userService.findOneUserById(id);
    this.sessions.setUserSocket(currentUser.id, socket);
    socket.emit('connected', {});
    this.logger.log(
      `${currentUser.firstName} has connected with ${socket.id}.`,
    );
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    this.logger.log('handleDisconnect');
    this.sessions.removeUserSocket(Number(socket.id));
    this.logger.log(`${socket.id} disconnected.`);
  }

  @SubscribeMessage('onRequestSent')
  notify(@CurrentUser('id') id: number, @MessageBody() data: any): void {
    const currentSocket = this.sessions.getUserSocket(id);
    if (currentSocket) {
      this.logger.log(currentSocket);
      this.server.emit('onRequestSent', data);
    }
  }
}
