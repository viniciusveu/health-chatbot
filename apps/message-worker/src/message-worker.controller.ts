import { Body, Controller, Logger, Post } from '@nestjs/common';
import { MessageWorkerService } from './message-worker.service';
import { EventPattern } from '@nestjs/microservices';
import { ContextOptions } from '@app/shared/enums';
import { MessageDataDto } from '@app/shared/dtos';

export class ReceivedMessageDto {
  body: string;
  from: string;
}

@Controller('messages')
export class MessageWorkerController {
  constructor(private readonly messageWorkerService: MessageWorkerService) {}

  @EventPattern(ContextOptions.SEND_MESSAGE)
  async sendMessage(msg: MessageDataDto): Promise<void> {
    await this.messageWorkerService.sendMessage(msg);
  }

  @Post('webhook')
  async receiveMessage(@Body() data: ReceivedMessageDto): Promise<void> {
    const message = await this.messageWorkerService.receiveMessage(data);
  }
}
