import { Injectable } from '@nestjs/common';
import { GenAIApi } from '../../infrastructure/providers/genai-api.provider';
import { AppointmentRepository } from '../../infrastructure/repositories/appointment.repository';
import { QueueClient } from '@app/queue';

@Injectable()
export class MessageReceivedUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly rabbitClient: QueueClient,
    private readonly generativeAI: GenAIApi,
  ) {}

  async execute(msg) {
    console.log('Message received', msg);
  }
}
