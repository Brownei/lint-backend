import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../decorators/public.decorator';
import { Response } from 'express';
import { Routes } from 'src/utils/constants';
import {
  AuthenticationGuard,
  CurrentUser,
  GoogleAuthGuard,
} from 'src/guard/auth.guard';
import { AuthUser } from 'src/decorators/auth.decorator';
import { UsersService } from '../users/services/users.service';

@ApiTags('auth')
@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() user: Record<string, any>) {
    return this.authService.login(user.email, user.password);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  handleLogin() {
    return { msg: 'Google Authentication' };
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  handleRedirect(@Res() res: Response) {
    res.redirect('http://localhost:5173/sign-up');
  }

  @Get('profile')
  async getProfile(@CurrentUser('id') id: number) {
    return await this.userService.findOneUserById(id);
  }

  @Public()
  @UseGuards(AuthenticationGuard)
  @Get('status')
  async status(@AuthUser() user: any) {
    return user ? user : 'Nothing to show here!';
  }

  // @Public()
  // @Get('facebook/callback')
  // @UseGuards(AuthGuard('facebook'))
  // facebookAuthRedirect(@Req() req, @Res() res: Response) {
  //   return this.authService.faceBookLogin(req, res);
  // }
}
