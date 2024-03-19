import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Links, User } from 'src/utils/typeorm';
// export type Links = {
//   link: string;
// };

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
  links: Links[];

  @ApiProperty({
    type: String,
    required: false,
    default: '',
  })
  @IsNotEmpty()
  profileImage: string;

  @ApiProperty({
    type: User,
  })
  @IsNotEmpty()
  user: User;
}
