import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { AuthorizationGuard } from './guard/auth.guard';
// import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
// import { FirebaseAuthGuard } from './auth/guard/firebase.guard';
import { AuthModule } from './auth/auth.module';
import { CollaboratorRequestModule } from './collaborator-requests/collaborator-requests.module';
import { ConversationsModule } from './conversations/conversations.module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagesModule } from './messages/messages.module';
import { CollaboratorsModule } from './collaborators/collaborators.module';
import { MessageAttachmentsModule } from './message-attachments/message-attachments.module';
import { RedisModule } from 'nestjs-redis-fork';
import { UtilsModule } from './utils/utils.module';
import { SocketModule } from './socket/socket.module';
import { NotificationsModule } from './notifications/notifications.module';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseAuthGuard } from './auth/guard/firebase.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule.forRoot({
      config: {
        host: 'redis',
        //host: '127.0.0.1',
        port: 6379
      }
    }),
    EventEmitterModule.forRoot(),
    UsersModule,
    PostsModule,
    UtilsModule,
    CollaboratorRequestModule,
    AuthModule,
    ConversationsModule,
    MessagesModule,
    CollaboratorsModule,
    MessageAttachmentsModule,
    SocketModule,
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AppModule {
  constructor() { }
}
