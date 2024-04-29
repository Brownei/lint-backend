import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  password?: string;

  @ApiProperty({
    type: String,
    uniqueItems: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: Boolean,
  })
  @IsBoolean()
  emailVerified: boolean;

  @ApiProperty({
    type: String,
    required: false,
    default: '',
  })
  @IsOptional()
  profileImage?: string;
}
