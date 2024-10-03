import { Injectable } from '@nestjs/common';
import { Params } from './socket.gateway';

@Injectable()
export class SocketService {
  private readonly sessions: Map<string, string>
  constructor() {
    this.sessions = new Map()
  }

  async addSocketToMap(parsedParams: Params[] | Params, socketId: string) {
    if (Array.isArray(parsedParams) === true) {
      parsedParams.forEach(async ({ userId }) => {
        // Add the user to the room in Redis
        this.sessions.set(userId, socketId)
      });
    } else {
      const { userId } = parsedParams
      this.sessions.set(userId, socketId)
    }
  }

  async removeSocketFromMap(parsedParams: Params[] | Params) {
    if (Array.isArray(parsedParams) === true) {
      parsedParams.forEach(async ({ userId }) => {
        // Add the user to the room in Redis
        this.sessions.delete(userId)
      });
    } else {
      const { userId } = parsedParams
      this.sessions.delete(userId)
    }

  }
}
