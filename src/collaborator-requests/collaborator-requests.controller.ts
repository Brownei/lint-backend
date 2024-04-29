import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CollaboratorRequestService } from './collaborator-requests.service';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/guard/auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateCollaboratorRequestDto } from './dto/create-collaborator-request.dto';
import { UsersService } from '../users/services/users.service';
import { PostsService } from '../posts/posts.service';
import { UpdateCollaboratorRequestDto } from './dto/update-collaboration-requests.dto';

@ApiTags('collaborators/requests')
@Controller('collaborators/requests')
export class CollaboratorRequestController {
  constructor(
    private readonly collaboratorRequestService: CollaboratorRequestService,
    private readonly userService: UsersService,
    private readonly postService: PostsService,
  ) {}

  @Get('sent')
  async getCollaboratorRequestsSent(@CurrentUser('email') email: string) {
    return await this.collaboratorRequestService.getCollaboratorRequestsSent(
      email,
    );
  }

  @Get('received')
  async getCollaboratorRequestsReceived(@CurrentUser('email') email: string) {
    return await this.collaboratorRequestService.getCollaboratorRequestsReceived(
      email,
    );
  }

  @Post()
  async createCollaboratorRequest(
    @CurrentUser('email') email: string,
    @Body() DTO: CreateCollaboratorRequestDto,
  ) {
    const sender = await this.userService.findOneUserByEmail(email);
    const receiver = await this.userService.findOneUserById(DTO.receiverId);
    console.log(sender.id)
	const postInterested = await this.postService.findOne(DTO.postId);
    const response = await this.collaboratorRequestService.create(
      sender.id,
      DTO.receiverId,
      DTO.postId,
	  DTO.content
    );
    const payload = { sender, receiver, postInterested };
    console.log(payload);
    return response;
  }

  @Delete(':id/cancel')
  async cancelFriendRequest(
    @CurrentUser('id') userId: number,
    @Param('id', ParseUUIDPipe) id: string,
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
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const response = await this.collaboratorRequestService.reject(id, userId);
    return response;
  }
}
