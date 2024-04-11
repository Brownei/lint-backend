import { IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  problem: string;

  @IsString()
  solution: string;

  @IsString()
  requirements: string;

  @IsString()
  techStacks: string;

  IsPaid: boolean;
}
