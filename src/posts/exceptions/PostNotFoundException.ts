/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus } from '@nestjs/common';

export class PostNotFoundException extends HttpException {
  constructor() {
    super('Post Not Found', HttpStatus.NOT_FOUND);
  }
}
