import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { AuthorizationGuard } from './guard/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FirebaseAuthGuard } from './guard/firebase.guard';
import { AuthModule } from './auth/auth.module';
import { CollaboratorRequestModule } from './collaborator-requests/collaborator-requests.module';
import { ConversationsModule } from './conversations/conversations.module';
import { LikesModule } from './likes/likes.module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    UsersModule,
    PostsModule,
    LikesModule,
    CollaboratorRequestModule,
    AuthModule,
    ConversationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AppModule {
  constructor() {}
}
