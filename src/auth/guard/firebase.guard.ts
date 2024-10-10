import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { type Request } from 'express';
import { admin } from '../firebase-admin.module';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { prisma } from 'src/prisma.module';

export type ReqWithUser = Request & {
  user: {
    id: string;
    email: string;
  };
  token: string;
};

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) { }
  logger = new Logger();

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    let sessionCookie: string;
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (!token) return false;

    if (type === 'Bearer') {
      sessionCookie = token;
    }

    if (!sessionCookie) {
      throw new UnauthorizedException('Unauthorized access!')
    };

    try {
      const decodedClaims = new JwtService().verify(token, {
        secret: process.env.JWT_SECRET
      });

      if (!decodedClaims) {
        throw new UnauthorizedException('Token has been expired')
      };

      const user = await prisma.user.findUnique({
        where: {
          id: decodedClaims.uid
        },
        select: {
          id: true,
          email: true,
          profile: true
        }
      })

      request.user = {
        email: user.email,
        id: user.profile.id,
      };

      return true
    } catch (_error) {
      this.logger.log('Unauthorized!');
      throw new UnauthorizedException('Unauthorized access!')
    }
  }
}
