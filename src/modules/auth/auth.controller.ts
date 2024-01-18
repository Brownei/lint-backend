import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Get,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../decorators/public.decorator';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Routes } from 'src/utils/constants';

@ApiTags('auth')
@Controller(Routes.AUTH)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() user: Record<string, any>, @Res() req: Response) {
    return this.authService.login(user.email, user.password, req);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res: Response) {
    return this.authService.googleLogin(req, res);
  }

  @Public()
  @Get('logout')
  @UseGuards(AuthGuard('google'))
  logout(@Req() req, @Res() res: Response) {
    return this.authService.logout(req, res);
  }

  @Public()
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  facebookAuthRedirect(@Req() req, @Res() res: Response) {
    return this.authService.faceBookLogin(req, res);
  }
}
