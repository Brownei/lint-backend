import { IsNotEmpty } from 'class-validator';

export class CreateProfileDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  occupation: string;

  @IsNotEmpty()
  location: string;

  @IsNotEmpty()
  bio: string;

  @IsNotEmpty()
  links: string[];

  @IsNotEmpty()
  profileImage: string;
}
