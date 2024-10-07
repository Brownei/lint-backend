import {
  Controller,
  Get,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';
import { CurrentUser } from '../auth/guard/auth.guard';

@Controller('collaborators')
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) { }

  @Get()
  async getAllCollaborators(@CurrentUser('email') email: string) {
    return await this.collaboratorsService.getAllCollaborators(email);
  }

  @Get('/:username')
  async getAllCollaboratorsConcerningAUser(@CurrentUser('email') email: string, @Param('username') username: string) {
    return await this.collaboratorsService.getAllCollaboratorsConcerningAUser(email, username);
  }


  @Delete(':id/delete')
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
