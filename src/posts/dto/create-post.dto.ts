import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @ApiProperty({
    isArray: true,
  })
  @IsArray()
  @IsNotEmpty()
  toolsTags: string[];
}
