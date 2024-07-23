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

@Injectable()
export class AuthService {
  constructor(private readonly userServices: UsersService) { }

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

  async verifyandUpdateUserWithEmailAndPassword(accessToken: string, loginDetails: LoginData): Promise<{
    decodedToken?: DecodedIdToken;
    userInfo?: UserReturns;
    error?: Error
  }> {
    const decodedToken = await admin.auth().verifyIdToken(accessToken);

    if (!decodedToken) {
      return {
        decodedToken: null,
        userInfo: null,
        error: new ConflictException('check your network!')
      };
    }

    if (decodedToken.email !== loginDetails.email) return {
      error: new ConflictException('check your network!')

    }
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

    if (!passwordMatch) return {
      error: new UnauthorizedException('Incorrect password')
    }

    const { password, ...otherDetails } = user
    return { decodedToken, userInfo: otherDetails };
  }


  async verifyAndCreateUserThroughEmailAndPassword(accessToken: string, createUserDto: CreateUserDto): Promise<{
    decodedToken?: DecodedIdToken;
    userInfo?: UserReturns;
    error?: Error
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

    if (userInfo) {
      return { decodedToken, userInfo };
    }

    const newUser = await this.userServices.createANewUser({
      email: decodedToken.email,
      fullName: createUserDto.fullName,
      profileImage: '',
      emailVerified: decodedToken.email_verified,
      password: createUserDto.password
    });

    await admin.auth().setCustomUserClaims(decodedToken.uid, {
      userId: newUser.user.id,
    });

    return { decodedToken, userInfo: newUser.user };
  }

  async verifyAndCreateUser(accessToken: string): Promise<{
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

    if (userInfo) {
      return { decodedToken, userInfo };
    }

    const newUser = await this.userServices.createANewUser({
      email: decodedToken.email,
      fullName: decodedToken.name,
      profileImage: decodedToken.picture,
      emailVerified: decodedToken.email_verified,
      password: decodedToken.sub,
    });

    await admin.auth().setCustomUserClaims(decodedToken.uid, {
      userId: newUser.user.id,
    });

    return { decodedToken, userInfo: newUser.user };
  }

  async createSessionCookie(accessToken: string): Promise<{
    sessionCookie?: string;
    expiresIn?: number;
    error?: Error
  }> {
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await admin.auth().createSessionCookie(accessToken, {
      expiresIn,
    });

    return { sessionCookie, expiresIn };
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
