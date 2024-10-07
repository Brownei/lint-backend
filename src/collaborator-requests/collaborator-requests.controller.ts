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
import { CurrentUser } from '../auth/guard/auth.guard';
import { CreateCollaboratorRequestDto } from './dto/create-collaborator-request.dto';
import { UsersService } from '../users/services/users.service';
import { PostsService } from '../posts/posts.service';
import { UpdateCollaboratorRequestDto } from './dto/update-collaboration-requests.dto';

@Controller('collaborators/requests')
export class CollaboratorRequestController {
  constructor(
    private readonly collaboratorRequestService: CollaboratorRequestService,
    private readonly userService: UsersService,
    private readonly postService: PostsService,
  ) { }

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
    console.log('Gotten here')
    const { particularPost: postInterested } = await this.postService.findOne(DTO.postId);

    if (!postInterested) throw new UnauthorizedException();

    const response = await this.collaboratorRequestService.create(
      email,
      DTO.receiverId,
      postInterested.id,
      DTO.content,
    );
    return response;
  }

  @Get('sent/:id')
  async getASingleInterestSent(@Param('id') id: string, @CurrentUser('email') email: string) {
    return await this.collaboratorRequestService.findSentRequestById(id, email)
  }

  @Get('received/:id')
  async getASingleInterestReceived(@Param('id') id: string, @CurrentUser('email') email: string) {
    return await this.collaboratorRequestService.findReceivedRequestById(id, email)
  }


  @Delete(':id/cancel')
  async cancelFriendRequest(
    @CurrentUser('id') userId: number,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    console.log(userId);
    return await this.collaboratorRequestService.cancel(id, userId);
  }

  @Put(':id/accept')
  async acceptFriendRequest(
    @CurrentUser('email') email: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() DTO: UpdateCollaboratorRequestDto,
  ) {

    return await this.collaboratorRequestService.accept(
      DTO,
      id,
      email,
    );
  }

  @Patch(':id/reject')
  async rejectFriendRequest(
    @CurrentUser('email') email: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.collaboratorRequestService.reject(id, email);
  }
}
