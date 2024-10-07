import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/auth';
import { admin } from './firebase-admin.module';
import { UserNotFoundException } from '../users/exceptions/UserNotFound';
import { LoginData, UserReturns } from '../utils/types/types';
import { UsersService } from '../users/services/users.service';
import { prisma } from '../prisma.module';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserSigninDTO } from './auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userServices: UsersService,
    private readonly jwtService: JwtService
  ) { }
  async verifyAndUpdateUser(accessToken: string): Promise<{
    decodedToken?: DecodedIdToken;
    error?: Error;
    userInfo?: UserReturns;
  }> {
    const decodedToken = await admin.auth().verifyIdToken(accessToken);

    const userInfo = await prisma.user.findUnique({
      where: {
        email: decodedToken.email,
      },
      select: {
        email: true,
        emailVerified: true,
        fullName: true,
        id: true,
        profile: true,
        profileImage: true,
      },
    });

    if (!userInfo) {
      return {
        error: new UserNotFoundException()
      };
    }

    return {
      decodedToken, userInfo
    };
  }

  async signIn(loginDetails: UserSigninDTO): Promise<{
    sessionCookie?: string;
    userInfo?: UserReturns;
    error?: Error
  }> {
    const user = await prisma.user.findUnique({
      where: {
        email: loginDetails.email,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        fullName: true,
        profileImage: true,
        password: true,
        profile: true,
      },
    });

    if (!user) {
      return {
        error: new UserNotFoundException()
      }
    }

    const passwordMatch = await bcrypt.compare(loginDetails.password, user.password)
    console.log(passwordMatch)

    if (!passwordMatch) {
      return {
        error: new UnauthorizedException('Incorrect password')
      }
    }

    const sessionCookie = this.jwtService.sign(
      { uid: user.id },
      {
        expiresIn: '1d',
        secret: process.env.JWT_SECRET,
      },
    );

    const { password, ...otherDetails } = user
    return { sessionCookie, userInfo: otherDetails };
  }


  async signUp(createUserDto: CreateUserDto): Promise<{
    sessionCookie?: string;
    userInfo?: UserReturns;
    error?: Error
  }> {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingUser) {
      return {
        error: new ConflictException('User already found!')
      }
    };

    await this.userServices.createANewUser({
      email: createUserDto.email,
      fullName: createUserDto.fullName,
      profileImage: createUserDto.profileImage,
      emailVerified: createUserDto.emailVerified,
      password: createUserDto.password
    });

    const { error, userInfo, sessionCookie } = await this.signIn({
      email: createUserDto.email,
      password: createUserDto.password
    })

    return { sessionCookie, userInfo, error };
  }

  async signUpWithGoogle(accessToken: string): Promise<{
    sessionCookie?: string;
    error?: Error;
    userInfo?: UserReturns;
  }> {
    const decodedToken = await admin.auth().verifyIdToken(accessToken);
    const userData = await admin.auth().getUser(decodedToken.uid)

    const existingUser = await prisma.user.findUnique({
      where: {
        email: decodedToken.email,
      },
    });

    if (existingUser) {
      return await this.signIn({
        password: decodedToken.uid,
        email: existingUser.email
      });
    }

    return await this.signUp({
      password: decodedToken.uid,
      email: decodedToken.email,
      fullName: userData.displayName,
      profileImage: decodedToken.picture,
      emailVerified: true
    })
  }

  async getUserInfo(email: string) {
    const userInfo =
      await this.userServices.findOneUserByEmailAndGetSomeData(email);

    if (!userInfo) return {
      error: new UserNotFoundException()
    }

    return userInfo;
  }

  async revokeToken(sessionCookie: string): Promise<{
    success?: HttpException
    error?: Error
  }> {
    try {
      const decodedToken = await admin
        .auth()
        .verifySessionCookie(sessionCookie, true);
      await admin.auth().revokeRefreshTokens(decodedToken.sub);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        return {
          error: new UnauthorizedException()
        }
      }

      return {
        success: new ConflictException()
      }
    }
  }

  async verifyToken(accessToken: string): Promise<{
    userInfo?: UserReturns
    error?: Error
  }> {
    const decodedToken = await admin.auth().verifySessionCookie(accessToken);

    const userInfo = await prisma.user.findUnique({
      where: {
        email: decodedToken.email,
      },
      select: {
        email: true,
        emailVerified: true,
        fullName: true,
        id: true,
        profile: true,
        profileImage: true,
      },
    });

    if (!userInfo) return {
      error: new NotFoundException('User not found!')
    }

    return {
      userInfo
    };
  }
}
