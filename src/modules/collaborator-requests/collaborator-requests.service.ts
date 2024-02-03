import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collaborator, CollaboratorRequest } from 'src/utils/typeorm';
import { UsersService } from '../users/services/users.service';
import { CollaboratorsService } from '../collaborators/collaborators.service';
import { CollaboratorAlreadyExists } from 'src/utils/exceptions/CollaboratorAlreadyExists';
import { CollaboratorException } from 'src/utils/exceptions/CollaboratorException';
import {
  SuccessAcceptedException,
  SuccessException,
  SuccessRejectedException,
} from 'src/utils/exceptions/SuccessExceptions';
import { CollaboratorNotFoundException } from 'src/utils/exceptions/CollaboratorNotFound';
import { UpdateCollaboratorRequestDto } from './dto/update-collaboration-requests.dto';

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

  async isPending(userId: number, postId: number, receiverId: number) {
    return await this.collaboratorRequestRepository.findOne({
      where: {
        sender: {
          id: userId,
        },
        receiver: {
          id: receiverId,
        },
        status: 'pending',
        post: {
          id: postId,
        },
      },
    });
  }

  async findById(id: number) {
    return await this.collaboratorRequestRepository.findOne({
      where: {
        id,
      },
      select: {
        id: true,
        post: {
          id: true,
          title: true,
        },
        sender: {
          firstName: true,
          lastName: true,
          email: true,
          gender: true,
          id: true,
          profileImage: true,
        },
        receiver: {
          firstName: true,
          lastName: true,
          email: true,
          gender: true,
          id: true,
          profileImage: true,
        },
      },
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
      relations: ['receiver', 'sender', 'post'],
      select: {
        sender: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          gender: true,
          profileImage: true,
        },
        receiver: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          gender: true,
          profileImage: true,
        },
        post: {
          id: true,
          title: true,
        },
      },
    });

    return requestReceived;
  }

  async create(senderId: number, receiverId: number, postId: number) {
    const sender = await this.userService.findOneUserById(senderId);
    const receiver = await this.userService.findOneUserById(receiverId);

    const curentlyPending = await this.isPending(
      sender.id,
      postId,
      receiver.id,
    );

    if (curentlyPending)
      throw new CollaboratorException('Collaborator Requesting Pending');

    if (receiverId === senderId)
      throw new CollaboratorException('Cannot Collaborate With Yourself');

    const areCollaborators = await this.collaboratorRepository.findOne({
      where: [
        {
          sender: {
            id: senderId,
          },
          receiver: {
            id: receiverId,
          },
        },
        {
          sender: {
            id: receiverId,
          },
          receiver: {
            id: senderId,
          },
        },
      ],
    });

    if (areCollaborators) throw new CollaboratorAlreadyExists();
    const collaboratorRequest = this.collaboratorRequestRepository.create({
      sender,
      receiver,
      post: {
        id: postId,
      },
      status: 'pending',
    });

    await this.collaboratorRequestRepository.save(collaboratorRequest);
  }

  async accept(DTO: UpdateCollaboratorRequestDto, userId: number) {
    const collaboratorRequest = await this.findById(DTO.requestId);
    if (!collaboratorRequest) throw new CollaboratorNotFoundException();
    if (collaboratorRequest.status === 'accepted')
      throw new CollaboratorException('Collaborator Request Already Accepted');
    if (collaboratorRequest.sender?.id === userId)
      throw new CollaboratorException('You cannot accept your own request');

    collaboratorRequest.status = 'accepted';
    const acceptedRequest =
      await this.collaboratorRequestRepository.save(collaboratorRequest);

    if (!acceptedRequest || acceptedRequest.status !== 'accepted') {
      throw new UnauthorizedException();
    }

    await this.collaboratorRepository.create({
      receiver: collaboratorRequest.receiver,
      sender: collaboratorRequest.sender,
    });

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
