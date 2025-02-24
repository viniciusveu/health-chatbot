import { Controller } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { EventPattern, Payload } from '@nestjs/microservices';

// todo remove this enum and use the one from the shared lib
export enum EventType {
  APPOINTMENT_CREATED = 'appointment-created',             // Notify the patient about the appointment
  CONFIRM_APPOINTMENT = 'confirm-appointment',
  AMBULANCE_DEPARTURE = 'ambulance-departure',
  FINALIZED_APPOINTMENT = 'finalized-appointment',
  COLLECT_FEEDBACK = 'collect-feedback',
  NEXT_APPOINTMENTS = 'next-appointments',
  CANCEL_APPOINTMENT = 'cancel-appointment',
  RESCHEDULE_APPOINTMENT = 'reschedule-appointment',
  EXAMS_DONE = 'exams-done',
  MEDICINE_REMINDER = 'prescription-done',
  FAQ = 'faq',
}

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


  @EventPattern(EventType.APPOINTMENT_CREATED)
  appointmentCreated(@Payload() msg): void {
    this.chatbotService.appointmentCreated(msg.data);
  }

  @EventPattern(EventType.CONFIRM_APPOINTMENT)
  confirmAppointment(@Payload() msg: ConfirmAppointmentDto): void {
    this.chatbotService.confirmAppointment(msg.data);
  }
}
