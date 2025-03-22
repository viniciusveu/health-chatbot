import { Injectable } from '@nestjs/common';
import { GenAIApi } from '../../infrastructure/providers/genai-api.provider';
import { EventDataDto, MessageDataDto } from '@app/shared/dtos';
import { ContextOptions } from '@app/shared/enums';
import { AppointmentRepository } from '../../infrastructure/repositories/appointment.repository';
import { QueueClient } from '@app/queue';

@Injectable()
export class ConfirmAppointmentUseCase {
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
        `Generate a short, natural-sounding WhatsApp message in Portuguese, confirming that the patient's appointment has been successfully confirmed. The message should be friendly yet professional and must not contain sensitive or personal data.

        Use the following details:
        - Patient's first name: ${appointment.Patient.name}
        - Appointment date and time: ${appointment.date_time}
        - Patient's gender: ${appointment.Patient.gender} (use this to make the message more natural)
        - Patient's age: ${appointment.Patient.age}

        Let the patient know that their appointment is confirmed and that they can reach out if they need to reschedule or have any questions.

        End the message with the contact number for assistance: 19998682834.`,
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
