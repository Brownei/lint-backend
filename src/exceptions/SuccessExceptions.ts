import { HttpException, HttpStatus } from '@nestjs/common';

export class SuccessException extends HttpException {
  constructor(msg?: string) {
    const defaultMessage = 'Successfully created';
    const message = msg ? defaultMessage.concat(': ', msg) : defaultMessage;
    super(message, HttpStatus.CREATED);
  }
}

export class SuccessSentException extends HttpException {
  constructor(msg?: string) {
    const defaultMessage = 'Successfully sent';
    const message = msg ? defaultMessage.concat(': ', msg) : defaultMessage;
    super(message, HttpStatus.OK);
  }
}

export class SuccessAcceptedException extends HttpException {
  constructor(msg?: string) {
    const defaultMessage = 'Accepted successfully';
    const message = msg ? defaultMessage.concat(': ', msg) : defaultMessage;
    super(message, HttpStatus.ACCEPTED);
  }
}

export class SuccessRejectedException extends HttpException {
  constructor(msg?: string) {
    const defaultMessage = 'Rejected successfully';
    const message = msg ? defaultMessage.concat(': ', msg) : defaultMessage;
    super(message, HttpStatus.ACCEPTED);
  }
}
