import { Controller } from '@nestjs/common';
import { MessageWorkerService } from './message-worker.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class MessageWorkerController {
  constructor(private readonly messageWorkerService: MessageWorkerService) {}

  @EventPattern('send-message')
  sendMessage(msg: any): void {
    this.messageWorkerService.sendMessage(msg);
  }
}
