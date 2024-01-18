import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MessageAttachment } from 'src/utils/typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MessageAttachmentsService {
  constructor(
    @InjectRepository(MessageAttachment)
    private readonly attachmentRepository: Repository<MessageAttachment>,
  ) {}

  create(attachments: string[]) {
    const promise = attachments.map(async (attachment) => {
      const newAttachment = this.attachmentRepository.create();
      newAttachment.attachments = attachment;
      return await this.attachmentRepository.save(newAttachment);
    });
    return Promise.all(promise);
  }

  deleteAllAttachments(attachments: MessageAttachment[]) {
    const promise = attachments.map((attachment) =>
      this.attachmentRepository.delete(attachment.id),
    );
    return Promise.all(promise);
  }
}
