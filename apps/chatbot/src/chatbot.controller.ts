import { Controller } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ContextOptions, PatientData } from '@app/shared';

interface ConfirmAppointmentDto {
  patientId: string;
  data: PatientData;
}

@Controller()
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) { }


  @EventPattern(ContextOptions.APPOINTMENT_CREATED)
  appointmentCreated(@Payload() msg): void {
    this.chatbotService.appointmentCreated(msg.data);
  }

  @EventPattern(ContextOptions.CONFIRM_APPOINTMENT)
  confirmAppointment(@Payload() msg: ConfirmAppointmentDto): void {
    this.chatbotService.confirmAppointment(msg.data);
  }
}
