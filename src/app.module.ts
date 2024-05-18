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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    UsersModule,
    PostsModule,
    CollaboratorRequestModule,
    AuthModule,
    ConversationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {}
}
