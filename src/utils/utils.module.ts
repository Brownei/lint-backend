/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { NotifyService } from 'src/notify.service';
import { CustomRedisService } from './redis.service';

@Global()
@Module({
  providers: [NotifyService, CustomRedisService],
  exports: [NotifyService, CustomRedisService]
})
export class UtilsModule { }

