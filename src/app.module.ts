import { Module } from '@nestjs/common';
import { UsersModule } from 'src/modules/users/users.module';
import { PostsModule } from 'src/modules/posts/posts.module';
import { LikesModule } from 'src/modules/likes/likes.module';
import { CollaboratorRequestModule } from 'src/modules/collaborator-requests/collaborator-requests.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
// import { AuthorizationGuard } from './guard/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { ConversationsModule } from 'src/modules/conversations/conversations.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FirebaseAuthGuard } from './guard/firebase.guard';

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
