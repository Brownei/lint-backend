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
  UnauthorizedException,
} from '@nestjs/common';
import { CollaboratorRequestService } from './collaborator-requests.service';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/guard/auth.guard';
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
    const postInterested = await this.postService.findOne(DTO.postId);

    if (!sender || !receiver || !postInterested)
      throw new UnauthorizedException();

    const response = await this.collaboratorRequestService.create(
      sender.id,
      receiver.id,
      postInterested.id,
      DTO.content,
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

  @Put(':id/accept')
  async acceptFriendRequest(
    @CurrentUser('email') email: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() DTO: UpdateCollaboratorRequestDto,
  ) {
    const receiver = await this.userService.findOneUserByEmail(email);

    if (!receiver) throw new UnauthorizedException();

    const response = await this.collaboratorRequestService.accept(
      DTO,
      id,
      receiver.id,
    );
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
