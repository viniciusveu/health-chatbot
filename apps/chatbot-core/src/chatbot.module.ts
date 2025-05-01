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
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@app/logging/logging.interceptor';
import { LoggingModule } from '@app/logging';
import { GetAppointmentFeedbackUseCase } from './application/use-cases/get-appointment-feedback.use-case';
import { FeedbackRepository } from './infrastructure/repositories/feedback.repository';

const USE_CASES = [
  AppointmentCreatedUseCase,
  ConfirmAppointmentUseCase,
  MessageReceivedUseCase,
  GetAppointmentFeedbackUseCase,
  // Add more use cases here
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/chatbot-core/.env'],
    }),
    QueueModule.register(QueuesEnum.MESSAGE_WORKER),
    DatabaseModule,
    LoggingModule,
  ],
  controllers: [ChatbotController],
  providers: [
    GenAIApi,
    AppointmentRepository,
    FeedbackRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    ...USE_CASES,
  ],
})
export class ChatbotModule {}
