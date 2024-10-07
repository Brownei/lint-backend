import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class UserSigninDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'john@gmail.com'
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    required: true
  })
  @IsNotEmpty()
  password: string;
}

export class GoogleSignUpDto {
  @ApiProperty({
    type: String,
    required: true
  })
  @IsNotEmpty()
  accessToken: string;
}
