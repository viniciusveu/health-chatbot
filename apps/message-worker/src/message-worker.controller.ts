import { Body, Controller, Post } from '@nestjs/common';
import { MessageWorkerService } from './message-worker.service';
import { EventPattern } from '@nestjs/microservices';
import { ContextOptions } from '@app/shared/enums';
import { MessageDataDto, ReceivedMessageDto } from '@app/shared/dtos';

@Controller('messages')
export class MessageWorkerController {
  constructor(private readonly messageWorkerService: MessageWorkerService) {}

  @EventPattern(ContextOptions.SEND_MESSAGE)
  async sendMessage(msg: MessageDataDto): Promise<void> {
    await this.messageWorkerService.sendMessage(msg);
  }

  @Post('webhook')
  async receiveMessage(@Body() data: ReceivedMessageDto): Promise<void> {
    console.log(`Message received: ${JSON.stringify(data)}`);
    
    await this.messageWorkerService.receiveMessage(data.From, data.Body);
  }
}
