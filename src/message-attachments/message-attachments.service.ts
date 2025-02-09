import { Injectable } from '@nestjs/common';
import { prisma } from '../prisma.module';
import { MessageAttachement } from '@prisma/client';

@Injectable()
export class MessageAttachmentsService {
  constructor() {}

  create(attachments: string[], messageId: string) {
    const promise = attachments.map(async (attachment) => {
      prisma.messageAttachement.create({
        data: {
          attachments: attachment,
          messageId,
        },
      });
    });
    return Promise.all(promise);
  }

  deleteAllAttachments(attachments: MessageAttachement[]) {
    const promise = attachments.map((attachment) =>
      prisma.messageAttachement.delete({
        where: {
          id: attachment.id,
        },
      }),
    );
    return Promise.all(promise);
  }
}
