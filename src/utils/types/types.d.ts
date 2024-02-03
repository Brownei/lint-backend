/* eslint-disable prettier/prettier */
import { Request } from '@nestjs/common';
import { User } from '../typeorm';
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

export type UserReturns = {
    firstName: string;
    lastName: string;
    email: string;
    gender: 'Male' | 'Female';
    profileImage: string;
    id: number;
}

export type PostReturns = {
    id: number,
    title: string,
    description: string,
    techStacks: string,
    problem: string,
    solution: string,
    requirements: string,
    isPaid: boolean,
    user: {
        id: number,
        firstName: string,
        lastName: string,
        profileImage: string,
    }
}

export interface AuthenticatedSocket extends Socket {
    user?: User;
}


declare module 'express-session' {
    interface SessionData {
        user: {
            email: number;
            firstName: string;
            lastName: string;
            picture: string;
            accessToken: string;
        };
    }
}

declare module 'express' {
    interface Request {
        user: {
            email: number;
            firstName: string;
            lastName: string;
            picture: string;
            accessToken: string;
        };
    }
}
