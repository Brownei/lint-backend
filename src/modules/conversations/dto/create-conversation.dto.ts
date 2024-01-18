import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
