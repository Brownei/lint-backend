import { HttpException, HttpStatus } from '@nestjs/common';

export class CollaboratorAlreadyExists extends HttpException {
  constructor() {
    super('Collaborator Already Exists', HttpStatus.CONFLICT);
  }
}
