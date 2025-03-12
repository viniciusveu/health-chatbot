import { IsString } from 'class-validator';

export class MessageDataDto {
  @IsString()
  message: string;

  @IsString()
  contact: string;
}
