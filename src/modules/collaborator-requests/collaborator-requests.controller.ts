import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CollaboratorRequestService } from './collaborator-requests.service';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/guard/auth.guard';
import { Routes } from 'src/utils/constants';
import { CreateCollaboratorRequestDto } from './dto/create-collaborator-request.dto';

@ApiTags(Routes.COLLABORATORS_REQUESTS)
@Controller(Routes.COLLABORATORS_REQUESTS)
export class CollaboratorRequestController {
  constructor(
    private readonly collaboratorRequestService: CollaboratorRequestService,
  ) {}

  @Get()
  async getCollaboratorRequestsSent(@CurrentUser('id') userId: number) {
    return await this.collaboratorRequestService.getCollaboratorRequestsReceived(
      userId,
    );
  }

  @Get()
  async getCollaboratorRequestsReceived(@CurrentUser('id') userId: number) {
    return await this.collaboratorRequestService.getCollaboratorRequestsReceived(
      userId,
    );
  }

  @Post()
  async createCollaboratorRequest(
    @CurrentUser('id') userId: number,
    @Body() { firstName }: CreateCollaboratorRequestDto,
  ) {
    const response = await this.collaboratorRequestService.create(
      userId,
      firstName,
    );
    // this.event.emit('friendrequest.create', friendRequest);
    return response;
  }

  @Delete(':id/cancel')
  async cancelFriendRequest(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    console.log(userId);
    const response = await this.collaboratorRequestService.cancel(id, userId);
    // this.event.emit('friendrequest.cancel', response);
    return response;
  }

  @Patch(':id/reject')
  async rejectFriendRequest(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const response = await this.collaboratorRequestService.reject(id, userId);
    // this.event.emit(ServerEvents.FRIEND_REQUEST_REJECTED, response);
    return response;
  }
}
