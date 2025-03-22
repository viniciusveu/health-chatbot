import { Injectable } from '@nestjs/common';
import { GenAIApi } from '../../infrastructure/providers/genai-api.provider';
import { EventDataDto, MessageDataDto } from '@app/shared/dtos';
import { ContextOptions } from '@app/shared/enums';
import { AppointmentRepository } from '../../infrastructure/repositories/appointment.repository';
import { QueueClient } from '@app/queue';

@Injectable()
export class AppointmentCreatedUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly queueClient: QueueClient,
    private readonly generativeAI: GenAIApi,
  ) {}

  async execute(data: EventDataDto): Promise<void> {
    console.log('Data: ', data);
    try {
      const appointment = await this.appointmentRepository.getAppointmentById(
        data.appointmentId,
      );

      if (!appointment) {
        throw new Error('Agendamento não encontrado.');
      }

      const generatedMessage = await this.generativeAI.generateContent(
        `Generate a short, natural-sounding WhatsApp message in Portuguese, confirming a newly scheduled medical appointment. The message should be personalized but must not contain sensitive or personal data. 
      
        Use the following details:
        - Patient's first name: ${appointment.Patient.name}
        - Appointment date and time: ${appointment.date_time}
        - Patient's gender: ${appointment.Patient.gender} (use this to make the message more natural)
        - Patient's age: ${appointment.Patient.age}
      
        The tone should be professional yet friendly, as if written by a real person. Include a request for the patient to confirm the appointment details and contact us in case of any issues. 
      
        End the message with the contact number for confirmations: 19998682834.`,
      );

      this.queueClient.emit(
        ContextOptions.SEND_MESSAGE,
        new MessageDataDto(generatedMessage, appointment.Patient.phone),
      );
    } catch (error) {
      console.log(error);
    }
  }
}
