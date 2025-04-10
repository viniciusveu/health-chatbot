import { IsInt, IsString } from 'class-validator';

export class MessageDataDto {
  @IsInt()
  eventId?: number;

  @IsString()
  message: string;

  @IsString()
  contact: string;

  constructor(message: string, contact: string, eventId: number) {
    this.eventId = eventId;
    this.message = message;
    this.contact = '+55' + contact;
  }
}
