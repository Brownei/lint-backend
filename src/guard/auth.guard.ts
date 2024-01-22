/* eslint-disable prettier/prettier */
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import * as jwt from 'jsonwebtoken';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
    ) {}

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: `${process.env.JWT_SECRET}`,
            });
            request['email'] = payload;
        } catch {
            throw new UnauthorizedException();
        }

        return true;
    }
}

export const CurrentUser = createParamDecorator((data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    // if route is protected, there is a user set in auth.middleware
    if (!!request.session.user) {
        return !!data ? request.session.user[data] : request.session.user;
    }

    // in case a route is not protected, we still want to get the optional auth user from jwt
    const token = request.headers.authorization ? (request.headers.authorization as string).split(' ') : null;
    if (token && token[1]) {
        const decoded: any = jwt.verify(token[1], process.env.JWT_SECRET);
        return !!data ? decoded[data] : decoded.user;
    }
});

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const activate = (await super.canActivate(context)) as boolean;
        const request = context.switchToHttp().getRequest();
        await super.logIn(request);
        return activate;
    }
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        return request.isAuthenticated()
    }
}