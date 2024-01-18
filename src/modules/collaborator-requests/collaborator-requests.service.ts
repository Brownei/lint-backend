import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collaborator, CollaboratorRequest } from 'src/utils/typeorm';
import { UsersService } from '../users/services/users.service';
import { UserNotFoundException } from 'src/utils/exceptions/UserNotFound';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { CollaboratorAlreadyExists } from 'src/utils/exceptions/CollaboratorAlreadyExists';
import { CollaboratorException } from 'src/utils/exceptions/CollaboratorException';
import {
  SuccessAcceptedException,
  SuccessException,
  SuccessRejectedException,
  SuccessSentException,
} from 'src/utils/exceptions/SuccessExceptions';
import { CollaboratorNotFoundException } from 'src/utils/exceptions/CollaboratorNotFound';

@Injectable()
export class CollaboratorRequestService {
  constructor(
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: Repository<Collaborator>,
    @InjectRepository(CollaboratorRequest)
    private readonly collaboratorRequestRepository: Repository<CollaboratorRequest>,
    @Inject(UsersService)
    private readonly userService: UsersService,
    @Inject(CollaboratorsService)
    private readonly collaboratorService: CollaboratorsService,
  ) {}

  async isPending(userOneId: number, userTwoId: number) {
    return await this.collaboratorRequestRepository.findOne({
      where: [
        {
          sender: { id: userOneId },
          receiver: { id: userTwoId },
          status: 'pending',
        },
        {
          sender: { id: userTwoId },
          receiver: { id: userOneId },
          status: 'pending',
        },
      ],
    });
  }

  async findById(id: number) {
    return await this.collaboratorRequestRepository.findOne({
      where: {
        id,
      },
      relations: ['receiver', 'sender'],
    });
  }

  async getCollaboratorRequestsSent(id: number) {
    const status = 'pending';
    const requestSent = await this.collaboratorRequestRepository.find({
      where: {
        sender: {
          id,
        },
        status,
      },
      relations: ['receiver', 'sender', 'receiver.profile', 'sender.profile'],
    });

    return requestSent;
  }

  async getCollaboratorRequestsReceived(id: number) {
    const status = 'pending';
    const requestReceived = await this.collaboratorRequestRepository.find({
      where: {
        receiver: {
          id,
        },
        status,
      },
      relations: ['receiver', 'sender', 'receiver.profile', 'sender.profile'],
    });

    return requestReceived;
  }

  async create(userId: number, firstName: string) {
    const sender = await this.userService.findOneUserById(userId);
    const receiver = await this.userService.findOneUserByFirstName(firstName);
    if (!receiver) throw new UserNotFoundException();

    const curentlyPending = await this.isPending(sender.id, receiver.id);

    if (curentlyPending)
      throw new CollaboratorException('Collaborator Requesting Pending');

    if (receiver.id === sender.id)
      throw new CollaboratorException('Cannot Add Yourself');

    const isCollaborators =
      await this.collaboratorService.isCurrentlyCollaborating(
        sender.id,
        receiver.id,
      );

    if (isCollaborators) throw new CollaboratorAlreadyExists();
    const collaboratorRequest = this.collaboratorRequestRepository.create({
      sender,
      receiver,
      status: 'pending',
    });

    await this.collaboratorRequestRepository.save(collaboratorRequest);
    throw new SuccessSentException();
  }

  async accept(id: number, userId: number) {
    const collaboratorRequest = await this.findById(id);
    if (!collaboratorRequest) throw new CollaboratorNotFoundException();
    if (collaboratorRequest.status === 'accepted')
      throw new CollaboratorException('Collaborator Request Already Accepted');
    if (collaboratorRequest.receiver.id !== userId)
      throw new CollaboratorException('You cannot accept your own request');

    collaboratorRequest.status = 'accepted';
    await this.collaboratorRequestRepository.save(collaboratorRequest);

    const newFriend = this.collaboratorRepository.create({
      sender: collaboratorRequest.sender,
      receiver: collaboratorRequest.receiver,
    });

    await this.collaboratorRepository.save(newFriend);
    throw new SuccessAcceptedException();
  }

  async reject(id: number, userId: number) {
    const collaboratorRequest = await this.findById(id);
    if (!collaboratorRequest) throw new CollaboratorNotFoundException();
    if (collaboratorRequest.status === 'accepted')
      throw new CollaboratorException('Collaborator Request Already Accepted');
    if (collaboratorRequest.receiver.id !== userId)
      throw new CollaboratorException('You cannot reject your own request');

    collaboratorRequest.status = 'rejected';
    await this.collaboratorRequestRepository.save(collaboratorRequest);

    throw new SuccessRejectedException();
  }

  async cancel(id: number, userId: number) {
    const collaboratorRequest = await this.findById(id);
    if (!collaboratorRequest) throw new CollaboratorNotFoundException();
    if (collaboratorRequest.sender.id !== userId)
      throw new CollaboratorException();
    await this.collaboratorRequestRepository.delete(id);
    throw new SuccessException('Successfully deleted');
  }
}
