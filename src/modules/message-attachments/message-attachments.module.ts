import { Module } from '@nestjs/common';
import { MessageAttachmentsService } from './message-attachments.service';

@Module({
  imports: [],
  providers: [MessageAttachmentsService],
})
export class MessageAttachmentsModule {}
