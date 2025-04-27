import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  private readonly client: Twilio;

  constructor(private readonly configService: ConfigService) {
    const accountSid =
      this.configService.getOrThrow<string>('TWILIO_ACCOUNT_SID');
    const authToken =
      this.configService.getOrThrow<string>('TWILIO_AUTH_TOKEN');
    this.client = new Twilio(accountSid, authToken);
  }

  async sendWhatsappMessage(to: string, body: string): Promise<string> {
    const from =
      'whatsapp:' + this.configService.get<string>('TWILIO_PHONE_NUMBER');

    const message = await this.client.messages.create({
      from,
      to: 'whatsapp:' + to,
      body,
    });

    return message.sid;
  }
}
