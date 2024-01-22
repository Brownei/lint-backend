import { Module } from '@nestjs/common';
import { UsersModule } from 'src/modules/users/users.module';
import { PostsModule } from 'src/modules/posts/posts.module';
import { LikesModule } from 'src/modules/likes/likes.module';
import { CollaboratorRequestModule } from 'src/modules/collaborator-requests/collaborator-requests.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthorizationGuard } from './guard/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { ConversationsModule } from 'src/modules/conversations/conversations.module';
import { PassportModule } from '@nestjs/passport';
import { GatewayModule } from './modules/gateway/gateway.module';
import entities from './utils/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return {
          type: 'mysql',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          database: config.get<string>('DB_DATABASE'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          entities,
          synchronize: true,
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ session: true }),
    EventEmitterModule.forRoot(),
    UsersModule,
    PostsModule,
    LikesModule,
    CollaboratorRequestModule,
    AuthModule,
    ConversationsModule,
    GatewayModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
  ],
})
export class AppModule {
  constructor() {}
}
