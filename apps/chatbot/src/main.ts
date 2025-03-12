import { NestFactory } from '@nestjs/core';
import { ChatbotModule } from './chatbot.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ChatbotModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'chatbot_queue',
        queueOptions: {
          durable: false,
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
