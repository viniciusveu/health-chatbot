import { Body, Controller, Post } from '@nestjs/common';
import { MessageWorkerService } from './message-worker.service';
import { EventPattern } from '@nestjs/microservices';
import { ContextOptions } from '@app/shared/enums';
import { MessageDataDto } from '@app/shared/dtos';
import { ReceivedMessageDto } from '@app/shared/dtos/received-message.dto';

@Controller('messages')
export class MessageWorkerController {
  constructor(private readonly messageWorkerService: MessageWorkerService) {}

  @EventPattern(ContextOptions.SEND_MESSAGE)
  async sendMessage(msg: MessageDataDto): Promise<void> {
    await this.messageWorkerService.sendMessage(msg);
  }

  @Post('webhook')
  async receiveMessage(@Body() data: ReceivedMessageDto): Promise<void> {
    await this.messageWorkerService.receiveMessage(data.from, data.body);
  }
}
