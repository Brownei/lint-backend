import { Module } from '@nestjs/common';
import { MessageAttachmentsService } from './message-attachments.service';

@Module({
  imports: [],
  providers: [MessageAttachmentsService],
  exports: [MessageAttachmentsService]
})
export class MessageAttachmentsModule { }
