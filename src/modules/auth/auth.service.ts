import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/services/users.service';
import { DecodedIdToken } from 'firebase-admin/auth';
import { User } from 'src/utils/typeorm';
import { admin } from 'src/utils/firebase';
import { UserNotFoundException } from 'src/utils/exceptions/UserNotFound';

@Injectable()
export class AuthService {
  constructor(private readonly userServices: UsersService) {}

  async verifyAndUpdateUser(accessToken: string): Promise<{
    decodedToken: DecodedIdToken;
    userInfo: User;
  }> {
    const decodedToken = await admin.auth().verifyIdToken(accessToken);

    console.log(decodedToken);

    const userInfo = await this.userServices.findOneUserByEmail(
      decodedToken.email,
      true,
    );

    if (userInfo) {
      return { decodedToken, userInfo };
    } else {
      const newUser = await this.userServices.createANewUser({
        email: decodedToken.email,
        fullName: decodedToken.name,
        profileImage: decodedToken.picture,
        emailVerified: decodedToken.email_verified,
      });

      await admin.auth().setCustomUserClaims(decodedToken.uid, {
        userId: newUser.id,
      });

      return { decodedToken, userInfo: newUser };
    }
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

  async getUserInfo(email: string): Promise<User> {
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
        throw new UnauthorizedException();
      }

      throw new ConflictException();
    }
  }
}
