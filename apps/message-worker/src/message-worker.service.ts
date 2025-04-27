import { LoggingService } from '@app/logging';
import { QueueClient } from '@app/queue';
import { MessageDataDto } from '@app/shared/dtos';
import { InternalContextOptions } from '@app/shared/enums';
import { Injectable, Logger } from '@nestjs/common';
import { TwilioService } from './twilio.service';

@Injectable()
export class MessageWorkerService {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly queueClient: QueueClient,
    private readonly twilioService: TwilioService,
  ) {}

  async sendMessage(data: MessageDataDto): Promise<void> {
    console.log('Sending msg: ', data);

    try {
      // if (this.configService.getOrThrow('NODE_ENV') === 'test') {
      //   await new Promise((resolve) => setTimeout(resolve, 3000));
      //   console.log('Msg sent to Twilio! (mock)');
      //   await this.loggingService.messageSent({ id: data.eventId, sid: 'mock' });
      //   return;
      // }

      const msgSid = await this.twilioService.sendWhatsappMessage(
        data.contact,
        data.message,
      );

      await this.loggingService.messageSent({ id: data.eventId, sid: msgSid });
    } catch (error) {
      await this.loggingService.messageSent({
        id: data.eventId,
        msgError: `${error}`,
      });
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
      const eventId = await this.loggingService.messageReceived({
        body: Body,
        from: From,
      });
      this.queueClient.emit(InternalContextOptions.MESSAGE_RECEIVED, {
        From,
        Body,
        eventId,
      });
    } catch (error) {
      throw error;
    }
  }
}
