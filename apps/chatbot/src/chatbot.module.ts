import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { GenAIApi } from './genai-api.provider';
import { DatabaseModule } from '@app/database';
import { QueuesEnum } from '@app/shared/enums';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'apps/chatbot/.env'],
    }),
    ClientsModule.register([
      {
        name: 'MESSAGE_WORKER',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
          queue: QueuesEnum.MESSAGE_WORKER,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    DatabaseModule,
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService, GenAIApi],
})
export class ChatbotModule {}
