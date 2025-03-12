import { Controller } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ContextOptions } from '@app/shared/enums';
import { EventDataDto } from '@app/shared/dtos';

@Controller()
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @EventPattern(ContextOptions.APPOINTMENT_CREATED)
  async appointmentCreated(@Payload() msg: EventDataDto) {
    await this.chatbotService.appointmentCreated(msg);
  }

  @EventPattern(ContextOptions.CONFIRM_APPOINTMENT)
  confirmAppointment(@Payload() msg: EventDataDto): void {
    this.chatbotService.confirmAppointment(msg);
  }
}
