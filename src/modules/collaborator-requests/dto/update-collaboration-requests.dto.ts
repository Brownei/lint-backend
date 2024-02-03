import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateCollaboratorRequestDto {
  @IsNotEmpty()
  @IsNumber()
  requestId: number;
}
