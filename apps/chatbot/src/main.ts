import { NestFactory } from '@nestjs/core';
import { ChatbotModule } from './chatbot.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QueuesEnum } from '@app/shared/enums';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ChatbotModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
        queue: QueuesEnum.CHATBOT,
        queueOptions: {
          durable: true,
        },
      },
    },
  );
  await app.listen();
}
bootstrap().catch((error) => console.log(error));
