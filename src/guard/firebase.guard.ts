import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { type Request } from 'express';
import { admin } from 'src/utils/firebase-admin.module';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';

export type ReqWithUser = Request & {
  user: {
    id: string;
    email: string;
  };
  token: string;
};

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  logger = new Logger();
  private extractTokenFromHeader(request: Request): string | undefined {
    const token = request.headers.authorization?.split(' ')[1];
    return token;
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const sessionCookie = this.extractTokenFromHeader(request);

    if (!sessionCookie) return false;

    try {
      const decodedClaims = await admin
        .auth()
        .verifySessionCookie(sessionCookie);
      if (!decodedClaims.email) return false;

      request.user = {
        email: decodedClaims.email,
        id: decodedClaims.uid,
      };

      this.logger.log('Paassed!');
      return true;
    } catch (_error) {
      this.logger.log('Unauthorized!');
      console.log(_error);
      return false;
    }
  }
}
