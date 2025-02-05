import { Controller } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { EventPattern, Payload } from '@nestjs/microservices';

interface PatientData {
  name: string;
  date: string;
  time: string;
  phone: string;
  gender: string;
  age: number;
}

interface ConfirmAppointmentDto {
  patientId: string;
  data: PatientData;
}

@Controller()
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) { }

  // {
  //   "pattern": "confirm-appointment",
  //   "data": {
  //     "name": "John Doe",
  //     "date": "2025-10-10",
  //     "time": "10:30"
  //   }
  // }
  @EventPattern('confirm-appointment')
  confirmAppointment(@Payload() msg: ConfirmAppointmentDto): void {
    this.chatbotService.confirmAppointment(msg.data);
  }
}
