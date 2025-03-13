import { IsString } from 'class-validator';

export class MessageDataDto {
  @IsString()
  message: string;

  @IsString()
  contact: string;

  constructor(message: string, contact: string) {
    this.message = message;
    this.contact = '+55' + contact;
  }
}
