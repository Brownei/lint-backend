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
  HttpException,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { Public } from '../decorators/public.decorator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginData } from 'src/utils/types/types';
import { GoogleSignUpDto, UserSigninDTO } from './auth.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtServive: JwtService
  ) { }

  @Public()
  @Post('google/login')
  async login(@Body() dto: GoogleSignUpDto) {
    return await this.authService.signUpWithGoogle(dto.accessToken);
  }

  @Public()
  @Post('login')
  async loginWithEmailAndPassword(@Body() loginDetails: UserSigninDTO) {
    return await this.authService.signIn(loginDetails);
  }

  @Public()
  @Post('google/register')
  async register(@Body() dto: GoogleSignUpDto) {
    return await this.authService.signUpWithGoogle(dto.accessToken);
  }

  @Public()
  @Post('register')
  async registerWithCredentials(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signUp(createUserDto);
  }

  @Get('user')
  async getUserInfo(@Req() req: Request, @Res() res: Response) {
    let accessToken: string;
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    if (!token) return false;

    if (type === 'Bearer') {
      accessToken = token;
    }

    return await this.jwtServive.verify(accessToken, {
      secret: process.env.JWT_SECRET
    });
  }
}
