import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEmpty, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    type: String,
    nullable: true,
  })
  @IsEmpty()
  password: string;

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
  @IsEmpty()
  profileImage: string;
}
