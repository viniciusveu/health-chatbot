import { Module } from '@nestjs/common';
import { ChatbotController } from './interfaces/controllers/chatbot.controller';
import { ConfigModule } from '@nestjs/config';
import { GenAIApi } from './infrastructure/providers/genai-api.provider';
import { DatabaseModule } from '@app/database';
import { QueuesEnum } from '@app/shared/enums';
import { AppointmentRepository } from './infrastructure/repositories/appointment.repository';
import { AppointmentCreatedUseCase } from './application/use-cases/appointment-created.use-case';
import { ConfirmAppointmentUseCase } from './application/use-cases/confirm-appointment.use-case';
import { MessageReceivedUseCase } from './application/use-cases/message-received.use-case';
import { QueueModule } from '@app/queue';

const USE_CASES = [
  AppointmentCreatedUseCase,
  ConfirmAppointmentUseCase,
  MessageReceivedUseCase,
  // Add more use cases here
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/chatbot/.env'],
    }),
    QueueModule.register(QueuesEnum.MESSAGE_WORKER),
    DatabaseModule,
  ],
  controllers: [ChatbotController],
  providers: [GenAIApi, AppointmentRepository, ...USE_CASES],
})
export class ChatbotModule {}
