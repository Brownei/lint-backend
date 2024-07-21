/* eslint-disable prettier/prettier */
import { Request } from '@nestjs/common';
import { User } from '../typeorm';
import { Socket } from 'socket.io';
import { CollaboratorRequest, Post, Profile, Status } from '@prisma/client';

export interface HTTPRequest extends Request {
  user: UserDetails;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserDetails {
  fullName: string;
  id: number;
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

export type ProfileReturns = {
  id: number;
  username: string;
  fullName: string;
  occupation: string;
  location: string;
  bio: string;
}

export type CollaboratorsReturns = {
  receiver: {
    profileImage: string,
    fullName: string,
    occupation: string
  }
  sender: {
    profileImage: string,
    fullName: string,
    occupation: string
  }
}

export type CollaboratorsRequestReturns = {
  id: string;
  status: Status;
  post: Post;
  receiver: User;
  sender: User;
}
export type CollaboratorsRequestDetails = {
  id: string;
  content: string;
  createdAt: Date;
  post: {
    id: string;
    title: string;
    createdAt: Date;
  };
  sender: {
    occupation: string,
    fullName: string,
    username: string,
    profileImage: string,
  };
}

export

  export type PostReturns = {
    id: string,
    title: string,
    description: string,
    toolsTags: string[],
    profile: Profile,
    requests: CollaboratorRequest[]
    createdAt: Date
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

