/* eslint-disable prettier/prettier */
import { Request } from '@nestjs/common';
import { User } from '../typeorm';
import { Socket } from 'socket.io';
import { Profile } from '@prisma/client';

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
    profileImage: string;
}

export type UserReturns = {
    id: number;
    fullName: string;
    email: string;
    emailVerified: boolean;
    profileImage: string;
    profile: Profile;
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
        fullName: string,
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
            email: string;
            id: string;
        };
    }
}
