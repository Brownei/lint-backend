import { IsNotEmpty } from 'class-validator';

export class CreateCollaboratorRequestDto {
  @IsNotEmpty()
  firstName: string;
}
