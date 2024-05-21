import { IsBoolean, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  password?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsBoolean()
  emailVerified: boolean;

  @IsOptional()
  profileImage?: string;
}
