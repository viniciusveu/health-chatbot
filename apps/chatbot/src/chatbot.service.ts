import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GenAIApi } from './genai-api.provider';
import { EventDataDto, MessageDataDto } from '@app/shared/dtos';
import { RepositoryFactory } from '@app/database/repository.factory';
import { ContextOptions } from '@app/shared/enums';

@Injectable()
export class ChatbotService {
  constructor(
    @Inject('MESSAGE_WORKER') private readonly rabbitClient: ClientProxy,
    private readonly repositoryFactory: RepositoryFactory,
    private readonly genAI: GenAIApi,
  ) {}

  async appointmentCreated(data: EventDataDto): Promise<void> {
    console.log('Data: ', data);
    try {
      const appointmentRepository =
        this.repositoryFactory.getAppointmentRepository();
      const appointment = await appointmentRepository.getAppointmentById(
        data.appointmentId,
      );

      if (!appointment) {
        throw new Error('Agendamento não encontrado.');
      }

      const generatedMessage = await this.genAI.generateContent(
        `Generate a short, natural-sounding WhatsApp message in Portuguese, confirming a newly scheduled medical appointment. The message should be personalized but must not contain sensitive or personal data. 
      
        Use the following details:
        - Patient's first name: ${appointment.Patient.name}
        - Appointment date and time: ${appointment.date_time}
        - Patient's gender: ${appointment.Patient.gender} (use this to make the message more natural)
        - Patient's age: ${appointment.Patient.age}
      
        The tone should be professional yet friendly, as if written by a real person. Include a request for the patient to confirm the appointment details and contact us in case of any issues. 
      
        End the message with the contact number for confirmations: 19998682834.`,
      );

      this.rabbitClient.emit(
        ContextOptions.APPOINTMENT_CREATED,
        new MessageDataDto(generatedMessage, appointment.Patient.phone),
      );
    } catch (error) {
      console.log(error);
    }
  }

  async confirmAppointment(data: EventDataDto): Promise<void> {
    console.log('Data: ', data);
    try {
      const appointmentRepository =
        this.repositoryFactory.getAppointmentRepository();
      const appointment = await appointmentRepository.getAppointmentById(
        data.appointmentId,
      );

      if (!appointment) {
        throw new Error('Agendamento não encontrado.');
      }

      const generatedMessage = await this.genAI.generateContent(
        `Generate a short, natural-sounding WhatsApp message in Portuguese, confirming that the patient's appointment has been successfully confirmed. The message should be friendly yet professional and must not contain sensitive or personal data.

        Use the following details:
        - Patient's first name: ${appointment.Patient.name}
        - Appointment date and time: ${appointment.date_time}
        - Patient's gender: ${appointment.Patient.gender} (use this to make the message more natural)
        - Patient's age: ${appointment.Patient.age}

        Let the patient know that their appointment is confirmed and that they can reach out if they need to reschedule or have any questions.

        End the message with the contact number for assistance: 19998682834.`,
      );

      this.rabbitClient.emit(
        ContextOptions.CONFIRM_APPOINTMENT,
        new MessageDataDto(generatedMessage, appointment.Patient.phone),
      );
    } catch (error) {
      console.log(error);
    }
  }
}
