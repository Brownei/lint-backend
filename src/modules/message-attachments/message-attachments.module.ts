import { Module } from '@nestjs/common';
import { MessageAttachmentsService } from './message-attachments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageAttachment } from 'src/utils/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([MessageAttachment])],
  providers: [MessageAttachmentsService],
})
export class MessageAttachmentsModule {}
