import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { GenAIApi } from './genai-api.provider';
import { EventDataDto } from '@app/shared/dtos';

@Injectable()
export class ChatbotService {
  constructor(
    @Inject('MESSAGE_WORKER') private readonly rabbitClient: ClientProxy,
    private readonly genAI: GenAIApi,
  ) { }

  async appointmentCreated(data: any/*EventDataDto*/): Promise<void> {
    console.log('Data: ', data);
    try {
      const generatedMessage = await this.genAI.generateContent(
        `Give me a short message in portuguese like you are a real person saying that an appoint was just scheduled for a patient (${data.name}) on ${data.date} at ${data.time}. 
        It will be sent by Whatsapp and you can personalize the message with the age and gender of the patient but no send sensitive/personal data: age (${data.age}), gender (${data.gender}). Tell the patient to confirm the appointment info and return case of something wrong on the tel 19998682834.`
      );

      this.rabbitClient.emit('send-message', Object.assign(data, generatedMessage));
    } catch (error) {
      console.log(error);
    }
  }

  async confirmAppointment(data: any/*EventDataDto*/): Promise<void> {
    console.log('Data: ', data);
    try {
      const generatedMessage = await this.genAI.generateContent(
        `Give me a short message in portuguese like you are a real person saying that the appointment has been confirmed for ${data.name} on ${data.date} at ${data.time}. 
        It will be sent by Whatsapp and you can personalize the message with the age and gender of the patient: age (${data.age}), gender (${data.gender})`
      );

      this.rabbitClient.emit('send-message', Object.assign(data, generatedMessage));
    } catch (error) {
      console.log(error);
    }
  }
} 