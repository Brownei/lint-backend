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
  constructor(private readonly collaboratorsService: CollaboratorsService) { }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  async getAllCollaborators(@CurrentUser('email') email: string) {
    return await this.collaboratorsService.getAllCollaborators(email);
  }

  @Delete(':id/delete')
  @UseGuards(FirebaseAuthGuard)
  async deleteCollaborator(
    @CurrentUser('email') email: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const collaborator = await this.collaboratorsService.deleteCollaborator(
      id,
      email,
    );
    return collaborator;
  }
}
