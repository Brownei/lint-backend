import { Controller, Get, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CollaboratorsService } from './collaborators.service';
import { CurrentUser } from 'src/guard/auth.guard';
import { Routes } from 'src/utils/constants';
import { ApiTags } from '@nestjs/swagger';

@ApiTags(Routes.COLLABORATORS)
@Controller(Routes.COLLABORATORS)
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  @Get()
  async getAllCollaborators(@CurrentUser('id', ParseIntPipe) id: number) {
    return await this.collaboratorsService.getAllCollaborators(id);
  }

  @Delete(':id/delete')
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
