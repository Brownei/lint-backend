import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { CollaboratorRequestService } from './collaborator-requests.service';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/guard/auth.guard';
import { Routes } from 'src/utils/constants';
// import { CreateCollaboratorRequestDto } from './dto/create-collaborator-request.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateCollaboratorRequestDto } from './dto/create-collaborator-request.dto';
import { UsersService } from '../users/services/users.service';
import { PostsService } from '../posts/posts.service';
import { UpdateCollaboratorRequestDto } from './dto/update-collaboration-requests.dto';

@ApiTags(Routes.COLLABORATORS_REQUESTS)
@Controller(Routes.COLLABORATORS_REQUESTS)
export class CollaboratorRequestController {
  constructor(
    private readonly collaboratorRequestService: CollaboratorRequestService,
    private event: EventEmitter2,
    private readonly userService: UsersService,
    private readonly postService: PostsService,
  ) {}

  @Get('sent')
  async getCollaboratorRequestsSent(@CurrentUser('id') id: number) {
    return await this.collaboratorRequestService.getCollaboratorRequestsSent(
      id,
    );
  }

  @Get('received')
  async getCollaboratorRequestsReceived(@CurrentUser('id') id: number) {
    return await this.collaboratorRequestService.getCollaboratorRequestsReceived(
      id,
    );
  }

  @Post()
  async createCollaboratorRequest(
    @CurrentUser('id', ParseIntPipe) id: number,
    @Body() DTO: CreateCollaboratorRequestDto,
  ) {
    const sender = await this.userService.findOneUserById(id);
    const receiver = await this.userService.findOneUserById(DTO.receiverId);
    const postInterested = await this.postService.findOne(DTO.postId);
    const response = await this.collaboratorRequestService.create(
      id,
      DTO.receiverId,
      DTO.postId,
    );
    const payload = { sender, receiver, postInterested };
    console.log(payload);
    return response;
  }

  @Delete(':id/cancel')
  async cancelFriendRequest(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    console.log(userId);
    const response = await this.collaboratorRequestService.cancel(id, userId);
    return response;
  }

  @Put('/accept')
  async acceptFriendRequest(
    @CurrentUser('id') userId: number,
    @Body() DTO: UpdateCollaboratorRequestDto,
  ) {
    const response = await this.collaboratorRequestService.accept(DTO, userId);
    // const sender = await this.userService.findOneUserById(userId);
    // const receiver = await this.userService.findOneUserById(DTO.requestId);
    // const payload = { sender };
    return response;
  }

  @Patch(':id/reject')
  async rejectFriendRequest(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const response = await this.collaboratorRequestService.reject(id, userId);
    return response;
  }
}
