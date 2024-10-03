import { Injectable, MethodNotAllowedException } from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRedis } from 'nestjs-redis-fork';
import { prisma } from 'src/prisma.module';
import { Socket } from 'socket.io';
import { Params } from 'src/socket/socket.gateway';

@Injectable()
export class CustomRedisService {
  private readonly onlineUsers = 'online-users'
  private readonly redisPrefix = 'offline-messages'

  constructor(
    @InjectRedis()
    private readonly redis: Redis,
  ) { }

  async setUserOnline(parsedParams: Params[] | Params, client: Socket) {
    if (Array.isArray(parsedParams) === true) {
      parsedParams.forEach(async ({ userId, conversationIds }) => {
        // Add the user to the room in Redis
        console.log(conversationIds)
        await this.redis.set(userId, client.id)
        await this.redis.hset(this.onlineUsers, userId, client.id);
        for (const conversationId of conversationIds) {
          await this.redis.hset(`Conversation:${conversationId}`, userId, client.id);
        }
      });
    } else {
      const { userId, conversationIds } = parsedParams
      await this.redis.set(userId, client.id)
      await this.redis.hset(this.onlineUsers, userId, client.id);
      for (const conversationId of conversationIds) {
        await this.redis.hset(`Conversation:${conversationId}`, userId, client.id);
      }
    }
  }

  async setUserOffline(parsedParams: Params[] | Params) {
    if (Array.isArray(parsedParams) === true) {
      parsedParams.forEach(async ({ userId, conversationIds }) => {
        // Remove the user from Redis
        await this.redis.del(userId)
        await this.redis.hdel(this.onlineUsers, userId);
        for (const conversationId of conversationIds) {
          await this.redis.hdel(`Conversation:${conversationId}`, userId);
        }
      });
    } else {
      const { userId, conversationIds } = parsedParams
      await this.redis.del(userId)
      await this.redis.hdel(this.onlineUsers, userId);
      for (const conversationId of conversationIds) {
        await this.redis.hdel(`Conversation:${conversationId}`, userId);
      }
    }
  }

  async getOnlineUsersInAConversation(conversationId: string) {
    return await this.redis.hgetall(`Conversation:${conversationId}`);
  }

  async getAllOnlineUsersInThePlatform() {
    return await this.redis.hgetall(this.onlineUsers);
  }

  async getUserSocket(userId: string) {
    return await this.redis.get(userId);
  }

  async getSocketIds(userIds: string[], conversationId: string) {
    const socketIds = new Set()
    for (const id of userIds) {
      const socketId = await this.redis.hget(`Conversation:${conversationId}`, id)
      socketIds.add(socketId)
    }

    return Array.from(socketIds);
  }

  async isUserOnline(userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.redis.exists(userId, (err, reply) => {
        if (err) return reject(err);
        resolve(reply === 1);
      });
    });
  }
}
