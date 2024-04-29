import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCollaboratorRequestDto {
  @IsNotEmpty()
  @IsNumber()
  receiverId: number;

  @IsNotEmpty()
  @IsString()
  postId: string;


  @IsNotEmpty()
  @IsString()
  content: string;
}
