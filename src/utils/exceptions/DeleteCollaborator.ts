/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus } from '@nestjs/common';

export class DeleteCollaboratorException extends HttpException {
  constructor() {
    super('User already exists', HttpStatus.FOUND);
  }
}
