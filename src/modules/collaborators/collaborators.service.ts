import { Collaborator } from 'src/utils/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CollaboratorNotFoundException } from 'src/utils/exceptions/CollaboratorNotFound';
import { NotCollaboratingException } from 'src/utils/exceptions/NotCollaborating';
import { DeleteCollaboratorException } from 'src/utils/exceptions/DeleteCollaborator';

@Injectable()
export class CollaboratorsService {
  constructor(
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: Repository<Collaborator>,
  ) {}

  async getAllCollaborators(id: number) {
    return await this.collaboratorRepository.find({
      where: [{ sender: { id } }, { receiver: { id } }],
      relations: ['sender', 'receiver'],
      select: {
        receiver: {
          fullName: true,
          id: true,
          email: true,
          profileImage: true,
        },
        sender: {
          fullName: true,
          id: true,
          email: true,
          profileImage: true,
        },
      },
    });
  }

  async findCollaboratorById(id: number) {
    const collaborator = await this.collaboratorRepository.findOne({
      where: {
        id,
      },
      relations: ['sender', 'receiver', 'sender.profile', 'receiver.profile'],
    });

    if (!collaborator) throw new CollaboratorNotFoundException();

    return collaborator;
  }

  async deleteCollaborator(id: number, userId: number) {
    const collaborator = await this.findCollaboratorById(id);
    if (!collaborator) throw new CollaboratorNotFoundException();
    if (
      collaborator.receiver.id !== userId ||
      collaborator.sender.id !== userId
    )
      throw new DeleteCollaboratorException();
    await this.collaboratorRepository.delete(id);
    return collaborator;
  }

  async isCurrentlyCollaborating(senderId: number, receiverId: number) {
    const currentlyCollaborating = await this.collaboratorRepository.find({
      where: [
        {
          sender: { id: senderId },
          receiver: { id: receiverId },
        },
        {
          sender: { id: receiverId },
          receiver: { id: senderId },
        },
      ],
    });

    if (!currentlyCollaborating) throw new NotCollaboratingException();

    return currentlyCollaborating;
  }
}
