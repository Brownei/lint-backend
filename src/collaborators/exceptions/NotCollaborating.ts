/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus } from '@nestjs/common';

export class NotCollaboratingException extends HttpException {
  constructor() {
    super('Not currently collaborating', HttpStatus.FOUND);
  }
}
