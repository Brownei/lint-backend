import { IsArray, IsOptional, IsString } from "class-validator";

/* eslint-disable prettier/prettier */
export class CreateMessageDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @IsOptional()
  attachments?: string[];
}
