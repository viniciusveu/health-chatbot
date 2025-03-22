import { Controller } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ContextOptions } from '@app/shared/enums';
import { EventDataDto, ReceivedMessageDto } from '@app/shared/dtos';

@Controller()
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @EventPattern(ContextOptions.MESSAGE_RECEIVED)
  async messageReceived(@Payload() msg: ReceivedMessageDto): Promise<void> {
    await this.chatbotService.messageReceived(msg);
  }
  

  @EventPattern(ContextOptions.APPOINTMENT_CREATED)
  async appointmentCreated(@Payload() msg: EventDataDto): Promise<void> {
    await this.chatbotService.appointmentCreated(msg);
  }

  @EventPattern(ContextOptions.CONFIRM_APPOINTMENT)
  async confirmAppointment(@Payload() msg: EventDataDto): Promise<void> {
    await this.chatbotService.confirmAppointment(msg);
  }
}
