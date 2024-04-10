import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({
    type: String,
    uniqueItems: true,
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  occupation: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  bio: string;

  @ApiProperty({
    isArray: true,
  })
  @IsNotEmpty()
  links: string[];

  @ApiProperty({
    type: String,
    required: false,
    default: '',
  })
  @IsNotEmpty()
  profileImage: string;

  @IsNotEmpty()
  user: User;
}
