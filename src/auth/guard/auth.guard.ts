/* eslint-disable prettier/prettier */
import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';

export const CurrentUser = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  if (!!request.user) {
    return !!data ? request.user[data] : request.user;
  }

  return new UnauthorizedException()
});
