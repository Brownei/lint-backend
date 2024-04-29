/* eslint-disable prettier/prettier */
import {
    ExecutionContext,
    UnauthorizedException,
    createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator((data: any, ctx: ExecutionContext) => {
    const request = <Request>ctx.switchToHttp().getRequest();
	console.log(request.user)

    if (!!request.user) {
        return !!data ? request.user[data] : request.user;
    }

    throw new UnauthorizedException()
});
