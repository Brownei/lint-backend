import { IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  problem_to_solve: string;

  @IsString()
  solution: string;

  @IsString()
  requirements: string;

  @IsString()
  tech_stacks: string;

  IsPaid: boolean;
}
