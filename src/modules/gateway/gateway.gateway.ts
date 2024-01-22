import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { Inject, Logger } from '@nestjs/common';
import { GatewaySessionManager } from './gateway,.session';
import { ConversationsService } from '../conversations/conversations.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { AuthenticatedSocket } from 'src/utils/types/types';
import { Conversation, Message } from 'src/utils/typeorm';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 15000,
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(GatewaySessionManager)
    private readonly sessions: GatewaySessionManager,
    @Inject(ConversationsService)
    private readonly conversationService: ConversationsService,
    @Inject(CollaboratorsService)
    private readonly collaboratorService: CollaboratorsService,
  ) {}

  @WebSocketServer()
  server: Server;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
    Logger.log('Incoming Connection');
    console.log(socket.id);
    this.sessions.setUserSocket(socket.id, socket);
    socket.emit('connected', {});
    Logger.log('Connected successfully');
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    Logger.log('handleDisconnect');
    this.sessions.removeUserSocket(socket.id);
    Logger.log(`${socket.id} disconnected.`);
  }

  @SubscribeMessage('onConversationJoin')
  onConversationJoin(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log(
      `${client.id} joined a Conversation of ID: ${data.conversationId}`,
    );
    client.join(`conversation-${data.conversationId}`);
    console.log(client.rooms);
    client.to(`conversation-${data.conversationId}`).emit('userJoin');
  }

  @SubscribeMessage('onConversationLeave')
  onConversationLeave(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onConversationLeave');
    client.leave(`conversation-${data.conversationId}`);
    console.log(client.rooms);
    client.to(`conversation-${data.conversationId}`).emit('userLeave');
  }

  @SubscribeMessage('onTypingStart')
  onTypingStart(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onTypingStart');
    console.log(data.conversationId);
    console.log(client.rooms);
    client.to(`conversation-${data.conversationId}`).emit('onTypingStart');
  }

  @SubscribeMessage('onTypingStop')
  onTypingStop(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onTypingStop');
    console.log(data.conversationId);
    console.log(client.rooms);
    client.to(`conversation-${data.conversationId}`).emit('onTypingStop');
  }

  @OnEvent('message.create')
  handleMessageCreateEvent(message: Message, conversations: Conversation) {
    console.log('Inside message.create');
    const {
      author,
      conversation: { creator, recipient },
    } = message;

    const payload = { message, conversations };
    const authorSocket = this.sessions.getUserSocket(String(author.id));
    const recipientSocket =
      author.id === creator.id
        ? this.sessions.getUserSocket(String(recipient.id))
        : this.sessions.getUserSocket(String(creator.id));

    if (authorSocket) authorSocket.emit('onMessage', payload);
    if (recipientSocket) recipientSocket.emit('onMessage', payload);
  }

  @OnEvent('conversation.create')
  handleConversationCreateEvent(payload: Conversation) {
    console.log('Inside conversation.create');
    const recipientSocket = this.sessions.getUserSocket(
      String(payload.recipient.id),
    );
    if (recipientSocket) recipientSocket.emit('onConversation', payload);
  }

  @OnEvent('message.delete')
  async handleMessageDelete(payload) {
    console.log('Inside message.delete');
    console.log(payload);
    const conversation = await this.conversationService.findById(
      payload.conversationId,
    );
    if (!conversation) return;
    const { creator, recipient } = conversation;
    const recipientSocket =
      creator.id === payload.userId
        ? this.sessions.getUserSocket(String(recipient.id))
        : this.sessions.getUserSocket(String(creator.id));
    if (recipientSocket) recipientSocket.emit('onMessageDelete', payload);
  }

  @OnEvent('message.update')
  async handleMessageUpdate(message: Message) {
    const {
      author,
      conversation: { creator, recipient },
    } = message;
    console.log(message);
    const recipientSocket =
      author.id === creator.id
        ? this.sessions.getUserSocket(String(recipient.id))
        : this.sessions.getUserSocket(String(creator.id));
    if (recipientSocket) recipientSocket.emit('onMessageUpdate', message);
  }

  @SubscribeMessage('getOnlineCollaborators')
  async handleFriendListRetrieve(
    @MessageBody() data: any,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { user } = socket;
    if (user) {
      console.log('user is authenticated');
      console.log(`fetching ${user.firstName}'s collaborators`);
      const collaborators = await this.collaboratorService.getAllCollaborators(
        user.id,
      );
      const onlineCollaborators = collaborators.filter((collaborator) =>
        this.sessions.getUserSocket(
          String(user.id) === String(collaborator.receiver.id)
            ? String(collaborator.sender.id)
            : String(collaborator.receiver.id),
        ),
      );
      socket.emit('getOnlineCollaborators', onlineCollaborators);
    }
  }
}
