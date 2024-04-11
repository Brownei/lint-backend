import { HttpException, HttpStatus } from '@nestjs/common';

export class MessageException extends HttpException {
  constructor(msg?: string) {
    const defaultMessage = 'Create Message Exception';
    const error = msg ? defaultMessage.concat(': ', msg) : defaultMessage;
    super(error, HttpStatus.BAD_REQUEST);
  }
}
