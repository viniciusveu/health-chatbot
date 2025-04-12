import { Injectable } from '@nestjs/common';
import { GenAIApi } from '../../infrastructure/providers/genai-api.provider';
import { EventDataDto, MessageDataDto } from '@app/shared/dtos';
import { InternalContextOptions } from '@app/shared/enums';
import { AppointmentRepository } from '../../infrastructure/repositories/appointment.repository';
import { QueueClient } from '@app/queue';
import { LoggingService } from '@app/logging';

@Injectable()
export class ConfirmAppointmentUseCase {
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

      const generatedMessage = await this.generativeAI.generateContent(
        `Generate a short, natural-sounding WhatsApp message in Portuguese, confirming that the patient's appointment has been successfully confirmed. The message should be friendly yet professional and must not contain sensitive or personal data.

        Use the following details:
        - Patient's first name: ${appointment.Patient.name}
        - Appointment date and time: ${appointment.date_time}
        - Patient's gender: ${appointment.Patient.gender} (use this to make the message more natural)
        - Patient's age: ${appointment.Patient.age}

        Let the patient know that their appointment is confirmed and that they can reach out if they need to reschedule or have any questions.

        End the message with the contact number for assistance: 19998682834.`,
      );

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
