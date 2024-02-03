import { Module } from '@nestjs/common';
import { CollaboratorRequestService } from './collaborator-requests.service';
import { CollaboratorRequestController } from './collaborator-requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collaborator, CollaboratorRequest, User } from 'src/utils/typeorm';
import { CollaboratorsModule } from '../collaborators/collaborators.module';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/services/users.service';
import { GatewayModule } from '../gateway/gateway.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CollaboratorRequest, Collaborator, User]),
    CollaboratorsModule,
    UsersModule,
    GatewayModule,
    PostsModule,
  ],
  controllers: [CollaboratorRequestController],
  providers: [CollaboratorRequestService, CollaboratorsService, UsersService],
  exports: [CollaboratorRequestService],
})
export class CollaboratorRequestModule {}
