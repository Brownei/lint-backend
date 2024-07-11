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
  UseGuards,
} from '@nestjs/common';
import { CollaboratorRequestService } from './collaborator-requests.service';
import { CurrentUser } from '../auth/guard/auth.guard';
import { CreateCollaboratorRequestDto } from './dto/create-collaborator-request.dto';
import { UsersService } from '../users/services/users.service';
import { PostsService } from '../posts/posts.service';
import { UpdateCollaboratorRequestDto } from './dto/update-collaboration-requests.dto';
import { FirebaseAuthGuard } from 'src/auth/guard/firebase.guard';
@Controller('collaborators/requests')
export class CollaboratorRequestController {
  constructor(
    private readonly collaboratorRequestService: CollaboratorRequestService,
    private readonly userService: UsersService,
    private readonly postService: PostsService,
  ) { }

  @Get('sent')
  @UseGuards(FirebaseAuthGuard)
  async getCollaboratorRequestsSent(@CurrentUser('email') email: string) {
    return await this.collaboratorRequestService.getCollaboratorRequestsSent(
      email,
    );
  }

  @Get('received')
  @UseGuards(FirebaseAuthGuard)
  async getCollaboratorRequestsReceived(@CurrentUser('email') email: string) {
    return await this.collaboratorRequestService.getCollaboratorRequestsReceived(
      email,
    );
  }

  @Post()
  @UseGuards(FirebaseAuthGuard)
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

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  async getASingleInterest(@Param('id') id: string) {
    return await this.collaboratorRequestService.findById(id)
  }

  @Delete(':id/cancel')
  @UseGuards(FirebaseAuthGuard)
  async cancelFriendRequest(
    @CurrentUser('id') userId: number,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    console.log(userId);
    const response = await this.collaboratorRequestService.cancel(id, userId);
    return response;
  }

  @Put(':id/accept')
  @UseGuards(FirebaseAuthGuard)
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
  @UseGuards(FirebaseAuthGuard)
  async rejectFriendRequest(
    @CurrentUser('id') userId: number,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const response = await this.collaboratorRequestService.reject(id, userId);
    return response;
  }
}
