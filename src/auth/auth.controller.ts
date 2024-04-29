import {
  Controller,
  HttpStatus,
  Post,
  Get,
  Res,
  Logger,
  Req,
  UnauthorizedException,
  BadRequestException,
  NotAcceptableException,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { config } from 'dotenv';
import { Public } from '../decorators/public.decorator';

config();

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Post('google/login')
  async login(@Req() req: Request, @Res() res: Response) {
    let accessToken: string;
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer') {
      accessToken = token;
    }
    if (!accessToken) {
      throw new UnauthorizedException('No access token!');
    }

    try {
      const { userInfo } =
        await this.authService.verifyAndUpdateUser(accessToken);

      const { sessionCookie, expiresIn } =
        await this.authService.createSessionCookie(accessToken);

      res.cookie('session', sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development',
        sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'lax',
      });

      const payload = {
        userInfo,
        sessionCookie,
      };

      res.send(payload);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        throw new UnauthorizedException('Major error cannot explain');
      }
      this.logger.error(error);
      throw new NotAcceptableException();
    }
  }

  @Public()
  @Post('google/register')
  async register(@Req() req: Request, @Res() res: Response) {
    let accessToken: string;
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer') {
      accessToken = token;
    }
    if (!accessToken) {
      throw new UnauthorizedException('No access token!');
    }

    try {
      const { userInfo } =
        await this.authService.verifyAndCreateUser(accessToken);

      const { sessionCookie, expiresIn } =
        await this.authService.createSessionCookie(accessToken);

      res.cookie('session', sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });

      const payload = {
        userInfo,
        sessionCookie,
      };

      res.send(payload);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        throw new UnauthorizedException('Major error cannot explain');
      }
      this.logger.error(error);
      throw new NotAcceptableException();
    }
  }

  @Get('user')
  async getUserInfo(@Req() req: Request, @Res() res: Response) {
    try {
      const user = await this.authService.getUserInfo(req.user.email);
      res.send(user);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        throw new UnauthorizedException();
      }
      this.logger.error(error);
      throw new BadRequestException('Bad request!');
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    try {
	  const accessToken = req.cookies.session as string | undefined | null

      if (!accessToken) {
        throw new UnauthorizedException('No access token!');
      }

      await this.authService.revokeToken(accessToken);
      res.clearCookie('session');
      return new HttpException('Logged out', HttpStatus.OK);
    } catch (error) {
      if (error instanceof Error) throw new UnauthorizedException();
      this.logger.error(error);
      throw new BadRequestException();
    }
  }
}
