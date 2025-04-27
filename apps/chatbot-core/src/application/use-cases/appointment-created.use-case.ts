import { Injectable } from '@nestjs/common';
import { GenAIApi } from '../../infrastructure/providers/genai-api.provider';
import { EventDataDto, MessageDataDto } from '@app/shared/dtos';
import { InternalContextOptions } from '@app/shared/enums';
import { AppointmentRepository } from '../../infrastructure/repositories/appointment.repository';
import { QueueClient } from '@app/queue';
import { LoggingService } from '@app/logging';

@Injectable()
export class AppointmentCreatedUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly loggingService: LoggingService,
    private readonly queueClient: QueueClient,
    private readonly generativeAI: GenAIApi,
  ) {}

  async execute(data: EventDataDto): Promise<void> {
    try {
      const appointment = await this.appointmentRepository.getAppointmentById(
        data.appointmentId,
      );

      if (!appointment) {
        throw new Error('Agendamento não encontrado.');
      }

      const textPrompt = 
        `Generate a short, natural-sounding WhatsApp message in Portuguese, confirming a newly scheduled medical appointment. The message should be personalized but must not contain sensitive or personal data. 
      
        Use the following details:
        - Patient's first name: ${appointment.Patient.name}
        - Appointment date and time: ${appointment.date_time}
        - Patient's gender: ${appointment.Patient.gender} (use this to make the message more natural)
        - Patient's age: ${appointment.Patient.age}
      
        The tone should be professional yet friendly, as if written by a real person. Include a request for the patient to confirm the appointment details and contact us in case of any issues. 
      
        End the message with the contact number for confirmations: 19998682834.`;

      const generatedMessage = await this.generativeAI.generateContent(textPrompt);

      await this.loggingService.eventProcessed({
        id: data.eventId,
        contactInfo: appointment.Patient.phone,
        msgContent: generatedMessage,
      });

      await this.queueClient.emit(
        InternalContextOptions.SEND_MESSAGE,
        new MessageDataDto(
          generatedMessage,
          appointment.Patient.phone,
          data.eventId,
        ),
      );
    } catch (error) {
      console.log(error);
      await this.loggingService.eventProcessed({
        id: data.eventId,
        msgError: `${error}`,
      });
    }
  }
}
