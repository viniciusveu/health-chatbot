import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { GenAIApi } from './genai-api.provider';

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
          urls: ['amqp://localhost:5672'],
          queue: 'message_worker_queue',
          queueOptions: {
            durable: false
          }
        },
      }
    ])
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService, GenAIApi],
})
export class ChatbotModule { }
