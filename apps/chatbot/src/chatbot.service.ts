import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GenAIApi } from './genai-api.provider';
import { EventDataDto } from '@app/shared/dtos';
import { RepositoryFactory } from '@app/database/repository.factory';

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
        `Give me a short message in portuguese like you are a real person saying that an appoint was just scheduled for a patient (${appointment.Patient.name}) on ${appointment.date_time}. 
        It will be sent by Whatsapp and you can personalize the message with the age and gender of the patient but no send sensitive/personal data: gender (${appointment.Patient.gender}). 
        Tell the patient to confirm the appointment info and return case of something wrong on the tel 19998682834.`,
      );

      this.rabbitClient.emit(
        'send-message',
        Object.assign(data, generatedMessage),
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
        `Give me a short message in portuguese like you are a real person saying that the appointment has been confirmed for ${appointment.Patient.name} on ${appointment.date}. 
        It will be sent by Whatsapp and you can personalize the message with the age and gender of the patient: gender (${appointment.Patient.gender})`,
      );

      this.rabbitClient.emit(
        'send-message',
        Object.assign(data, generatedMessage),
      );
    } catch (error) {
      console.log(error);
    }
  }
}
