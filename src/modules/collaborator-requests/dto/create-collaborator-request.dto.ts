import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCollaboratorRequestDto {
  @IsNotEmpty()
  @IsNumber()
  receiverId: number;

  @IsNotEmpty()
  @IsNumber()
  postId: number;
}
