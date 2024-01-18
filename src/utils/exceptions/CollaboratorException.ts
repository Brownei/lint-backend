import { HttpException, HttpStatus } from '@nestjs/common';

export class CollaboratorException extends HttpException {
  constructor(msg?: string) {
    const defaultMessage = 'Friend Request Exception';
    const error = msg ? defaultMessage.concat(': ', msg) : defaultMessage;
    super(error, HttpStatus.BAD_REQUEST);
  }
}
