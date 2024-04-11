/* eslint-disable prettier/prettier */
import {
    CanActivate,
    ConflictException,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
// import * as jwt from 'jsonwebtoken';
import { admin } from 'src/firebase-admin.module';

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
    ) {}

    private extractTokenFromHeader(request: Request): string | undefined {
        const token  = request.headers.authorization?.split(' ')[1];
        return token;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }
        
        try {
            const request = context.switchToHttp().getRequest<Request>();
            const token = this.extractTokenFromHeader(request);

            if(!token) throw new UnauthorizedException('No token available')

            const payload = await admin.auth().verifySessionCookie(token, true)

            if(!payload) throw new ConflictException('No payload gotten')
            console.log(payload)
            request.user = {
                id: payload.uid,
                email: payload.email,
            };
        } catch {
            throw new UnauthorizedException('No access granted!');
        }

        return true;
    }
}

export const CurrentUser = createParamDecorator((data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    // if route is protected, there is a user set in auth.middleware
    if (!!request.user) {
        return !!data ? request.user[data] : request.user;
    }

    throw new UnauthorizedException()

    // in case a route is not protected, we still want to get the optional auth user from jwt
    // const token = request.headers.authorization ? (request.headers.authorization as string).split(' ') : null;
    // if (token && token[1]) {
    //     const decoded: any = jwt.verify(token[1], process.env.JWT_SECRET);
    //     return !!data ? decoded[data] : decoded.user;
    // }
});