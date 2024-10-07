import { Logger, PayloadTooLargeException } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { INotification, SingleNotification } from './socket.dto';
import { CustomRedisService } from 'src/utils/redis.service';

export interface Params {
  userId: string;
  conversationIds: string[];
}

@WebSocketGateway({
  cors: "*"
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('SocketGateway');

  constructor(
    private readonly redisService: CustomRedisService
  ) { }

  async handleConnection(client: Socket) {
    try {
      const params = client.handshake.query.params as string; // Get user ID from the query params
      const parsedParams: Params[] | Params = JSON.parse(params);
      console.log(parsedParams)
      await this.redisService.setUserOnline(parsedParams, client)

    } catch (error) {
      this.logger.error('Error connecting: ', error)
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const params = client.handshake.query.params as string; // Get user ID from the query params
      const parsedParams: Params[] | Params = JSON.parse(params);
      await this.redisService.setUserOffline(parsedParams)
    } catch (error) {
      this.logger.error('Error disconnecting: ', error)
    }
  }

  async globalSingleWebSocketFunction(payload: SingleNotification, emitString: string) {
    try {
      // Get all users from the Redis room
      const userSocket = await this.redisService.getUserSocket(payload.userId)
      this.server.to(userSocket).emit(emitString, payload.message);
    } catch (error) {
      this.logger.error(`Couldnt send to ${emitString}: `, error)
    }
  }

  async globalAllWebSocketFunction(payload: any, emitString: string) {
    try {
      const usersInRoom = await this.redisService.getOnlineUsersInAConversation(payload.conversationId);

      // Send the message to each user in the room
      Object.values(usersInRoom).forEach(socketId => {
        console.log({ socketId })
        this.server.to(socketId).emit(emitString, payload);
      });

      //this.server.emit(emitString, payload);
    } catch (error) {
      this.logger.error(`Couldnt send to ${emitString}: `, error)
    }

  }

  async globalWebSocketFunction(payload: INotification, emitString: string) {
    try {
      // Get all users from the Redis room
      const usersInRoom = await this.redisService.getOnlineUsersInAConversation(payload.conversationId);

      // Send the message to each user in the room
      Object.values(usersInRoom).forEach(socketId => {
        console.log({ socketId })
        this.server.to(socketId).emit(emitString, payload.message);
      });

    } catch (error) {
      this.logger.error(`Couldnt send to ${emitString}: `, error)
    }

  }
}
