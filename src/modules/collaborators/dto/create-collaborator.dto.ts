import { User } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class CreateCollaboratorDto {
  @IsNotEmpty()
  receiver: User;

  @IsNotEmpty()
  sender: User;
}
