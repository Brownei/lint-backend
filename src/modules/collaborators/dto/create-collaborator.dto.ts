import { IsNotEmpty } from 'class-validator';
import { User } from 'src/utils/typeorm';

export class CreateCollaboratorDto {
  @IsNotEmpty()
  receiver: User;

  @IsNotEmpty()
  sender: User;
}
