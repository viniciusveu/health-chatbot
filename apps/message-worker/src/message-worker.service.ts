import { QueueClient } from '@app/queue';
import { MessageDataDto } from '@app/shared/dtos';
import { ContextOptions } from '@app/shared/enums';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class MessageWorkerService {
  constructor(
    private readonly queueClient: QueueClient,
    private readonly configService: ConfigService,
  ) {}

  async sendMessage(data: MessageDataDto): Promise<void> {
    console.log('Sending msg: ', data);
    const accountSid =
      this.configService.getOrThrow<string>('TWILIO_ACCOUNT_SID');
    const authToken =
      this.configService.getOrThrow<string>('TWILIO_AUTH_TOKEN');
    const client = new Twilio(accountSid, authToken);

    try {
      client.messages
        .create({
          from: 'whatsapp:' + process.env.TWILIO_PHONE_NUMBER,
          to: 'whatsapp:' + data.contact, // '+5519998682835' '+551896654562' data.contact
          body: data.message,
        })
        .then((message) => console.log('Mensagem enviada:', message.sid));
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  }

  async receiveMessage(From: string, Body: string): Promise<void> {
    Logger.log(
      `Received incoming message from Twilio: From: ${From} | Message: ${Body}`,
    );

    if (!From || !Body) {
      Logger.warn(
        "Incomplete Twilio message received. Missing 'from' or 'body'.",
      );
      return null;
    }

    try {
      this.queueClient.emit(ContextOptions.MESSAGE_RECEIVED, { From, Body });
    } catch (error) {
      throw error;
    }
  }
}
