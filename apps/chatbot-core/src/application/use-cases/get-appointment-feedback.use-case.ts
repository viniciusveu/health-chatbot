import { Injectable } from '@nestjs/common';
import { GenAIApi } from '../../infrastructure/providers/genai-api.provider';
import { EventDataDto, MessageDataDto } from '@app/shared/dtos';
import { InternalContextOptions } from '@app/shared/enums';
import { AppointmentRepository } from '../../infrastructure/repositories/appointment.repository';
import { QueueClient } from '@app/queue';
import { LoggingService } from '@app/logging';

@Injectable()
export class GetAppointmentFeedbackUseCase {
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
        `Generate a short, natural-sounding WhatsApp message in Portuguese asking the people how much they like the consultation from 0 to 5. The message should be friendly yet professional and must not contain sensitive or personal data.

        Use the following details:
        - Patient's first name: ${appointment.Patient.name}
        - Appointment date and time: ${appointment.date_time}
        - Patient's gender: ${appointment.Patient.gender} (use this to make the message more natural)
        - Patient's age: ${appointment.Patient.age}
        `

      const generatedMessage = await this.generativeAI.generateContent(textPrompt);

      await this.loggingService.eventProcessed({
        id: data.eventId,
        contactInfo: appointment.Patient.phone,
        msgContent: generatedMessage,
      });

      this.queueClient.emit(
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
