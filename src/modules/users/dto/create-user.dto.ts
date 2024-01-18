import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEmpty, IsNotEmpty } from 'class-validator';

export enum Gender {
  Male = 'Male',
  Female = 'Female',
}

export class CreateUserDto {
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    type: Date,
  })
  @IsNotEmpty()
  birthdayDate: Date;

  @ApiProperty({
    type: Gender,
    enum: Gender,
  })
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({
    type: String,
    required: false,
    default: '',
  })
  @IsEmpty()
  profileImage: string;
}
