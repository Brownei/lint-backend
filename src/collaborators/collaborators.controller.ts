import {
  Controller,
  Get,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';
import { CurrentUser } from '../auth/guard/auth.guard';
import { FirebaseAuthGuard } from 'src/auth/guard/firebase.guard';

@Controller('collaborators')
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard)
  async getAllCollaborators(@CurrentUser('id', ParseIntPipe) id: number) {
    return await this.collaboratorsService.getAllCollaborators(id);
  }

  @Delete(':id/delete')
  @UseGuards(FirebaseAuthGuard)
  async deleteCollaborator(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const collaborator = await this.collaboratorsService.deleteCollaborator(
      id,
      userId,
    );
    return collaborator;
  }
}
