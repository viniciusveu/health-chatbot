import { Injectable } from '@nestjs/common';
import { GenAIApi } from '../../infrastructure/providers/genai-api.provider';
import { AppointmentRepository } from '../../infrastructure/repositories/appointment.repository';
import { QueueClient } from '@app/queue';
import { LoggingService } from '@app/logging';

@Injectable()
export class MessageReceivedUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly loggingService: LoggingService,
    private readonly rabbitClient: QueueClient,
    private readonly generativeAI: GenAIApi,
  ) {}

  async execute(msg) {
    console.log('Message received', msg);
    await this.loggingService.messageProcessed({});
  }
}
