/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus } from '@nestjs/common';

export class CollaboratorNotFoundException extends HttpException {
  constructor() {
    super('User already exists', HttpStatus.NOT_FOUND);
  }
}
