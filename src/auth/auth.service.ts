import {
  ConflictException,
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
import * as argon2 from 'argon2';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userServices: UsersService) { }

  async verifyAndUpdateUser(accessToken: string): Promise<{
    decodedToken: DecodedIdToken;
    userInfo: UserReturns;
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
      throw new UserNotFoundException();
    }

    return { decodedToken, userInfo };
  }

  async verifyandUpdateUserWithEmailAndPassword(accessToken: string, loginDetails: LoginData): Promise<{
    decodedToken: DecodedIdToken;
    userInfo: UserReturns;
  }> {
    const decodedToken = await admin.auth().verifyIdToken(accessToken);

    if (!decodedToken) {
      throw new ConflictException('check your network!');
    }

    if (decodedToken.email !== loginDetails.email) throw new ConflictException('You scammer!');

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
      throw new UserNotFoundException();
    }

    const passwordMatch = await bcrypt.compare(loginDetails.password, user.password)

    if (!passwordMatch) throw new UnauthorizedException('Incorrect password')

    const { password, ...otherDetails } = user
    return { decodedToken, userInfo: otherDetails };
  }


  async verifyAndCreateUserThroughEmailAndPassword(accessToken: string, createUserDto: CreateUserDto): Promise<{
    decodedToken: DecodedIdToken;
    userInfo: UserReturns;
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
      userId: newUser.id,
    });

    return { decodedToken, userInfo: newUser };
  }

  async verifyAndCreateUser(accessToken: string): Promise<{
    decodedToken: DecodedIdToken;
    userInfo: UserReturns;
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
      userId: newUser.id,
    });

    return { decodedToken, userInfo: newUser };
  }

  async createSessionCookie(accessToken: string): Promise<{
    sessionCookie: string;
    expiresIn: number;
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

    if (!userInfo) throw new UserNotFoundException();

    return userInfo;
  }

  async revokeToken(sessionCookie: string): Promise<void> {
    try {
      const decodedToken = await admin
        .auth()
        .verifySessionCookie(sessionCookie, true);
      await admin.auth().revokeRefreshTokens(decodedToken.sub);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
        throw new UnauthorizedException();
      }

      throw new ConflictException();
    }
  }

  async verifyToken(accessToken: string) {
    const decodedToken = await admin.auth().verifySessionCookie(accessToken);

    console.log(decodedToken);

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

    if (!userInfo) throw new NotFoundException('User not found!');

    return userInfo;
  }
}
