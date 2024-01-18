/* eslint-disable prettier/prettier */
import { Request } from '@nestjs/common';
import { User } from './typeorm';
import { Socket } from 'socket.io';

export interface HTTPRequest extends Request {
    user: UserDetails;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface UserDetails {
    firstName: string;
    lastName: string;
    email: string;
    birthdayDate: Date;
    gender: string;
    profileImage: string;
}

export interface AuthenticatedSocket extends Socket {
  user?: User;
}
