import { Module } from '@nestjs/common';
import { CollaboratorRequestService } from './collaborator-requests.service';
import { CollaboratorRequestController } from './collaborator-requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collaborator, CollaboratorRequest, User } from 'src/utils/typeorm';
import { CollaboratorsModule } from '../collaborators/collaborators.module';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/services/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CollaboratorRequest, Collaborator, User]),
    CollaboratorsModule,
    UsersModule,
  ],
  controllers: [CollaboratorRequestController],
  providers: [CollaboratorRequestService, CollaboratorsService, UsersService],
})
export class CollaboratorRequestModule {}
