import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { UsersService } from 'src/modules/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string) {
    const user = await this.userService.findOneUserByEmail(email);

    if (user) return user;
  }

  async login(email: string, password: string) {
    const user = await this.userService.findOneUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const { password: hashedPassword, ...otherDetails } = user;

    const correctPassword = await argon2.verify(hashedPassword, password);

    if (!correctPassword) {
      throw new ConflictException('Incorrect Password!');
    }

    const payload = {
      id: otherDetails.id,
      email: otherDetails.email,
      sub: {
        firstName: otherDetails.firstName,
        lastName: otherDetails.lastName,
        birthdayDate: otherDetails.birthdayDate,
        gender: otherDetails.gender,
      },
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: `${process.env.JWT_SECRET}`,
    });

    return accessToken;
  }

  async googleLogin(req: any, res: Response) {
    if (!req.user) {
      return 'No user avialable';
    }

    // const currentUser = await this.userService.findOneUserByEmail(
    //   req.user.email,
    // );

    res.cookie('session', req.user.accessToken);

    res.send(req.user.email);
  }

  async logout(req: Request, res: Response) {
    const token = req.cookies('session');
    res.send(token);
  }

  async faceBookLogin(req: any, res: Response) {
    if (!req.user) {
      res.send('No user avialable');
    }

    res.send(req.user);
  }

  async findUser(email: string) {
    const user = await this.userService.findOneUserByEmail(email);
    return user;
  }
}
