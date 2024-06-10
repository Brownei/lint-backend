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
  UseGuards,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { config } from 'dotenv';
import { Public } from '../decorators/public.decorator';
import { FirebaseAuthGuard } from './guard/firebase.guard';

config();

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(FirebaseAuthGuard)
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
  @UseGuards(FirebaseAuthGuard)
  @Post('login')
  async loginWithEmailAndPassword(
    @Req() req: Request,
    // @Res() res: Response,
    // @Body() loginDetails,
  ) {
    let accessToken: string;
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer') {
      accessToken = token;
    }
    if (!accessToken) {
      throw new UnauthorizedException('No access token!');
    }

    try {
      return await this.authService.verifyandUpdateUserWithEmailAndPassword(
        accessToken,
      );
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
  @UseGuards(FirebaseAuthGuard)
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
  @UseGuards(FirebaseAuthGuard)
  async getUserInfo(@Req() req: Request, @Res() res: Response) {
    let accessToken: string;
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    if (!token) return false;

    if (type === 'Bearer') {
      accessToken = token;
    }
    try {
      const accessedUser = await this.authService.verifyToken(accessToken);
      console.log('accessedUser', accessedUser);
      res.send(accessedUser);
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
  @UseGuards(FirebaseAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    try {
      let accessToken: string;
      const [type, token] = req.headers.authorization?.split(' ') ?? [];
      if (type === 'Bearer') {
        accessToken = token;
      }
      if (!accessToken) {
        throw new UnauthorizedException('No access token!');
      }

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
